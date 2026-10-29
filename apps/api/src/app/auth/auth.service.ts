import { User, UserRole } from '@app/database';
import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { Repository } from 'typeorm';

export interface TokenPayload {
  sub: string;
  username: string;
  role: UserRole;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private readonly secret = process.env.JWT_SECRET;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    if (!this.secret || this.secret.length < 16) {
      throw new Error('JWT_SECRET must be set (at least 16 characters).');
    }
  }

  /** Creates the first administrator when the database has no users yet. */
  async onModuleInit() {
    const password = process.env.ADMIN_PASSWORD;
    if (!password || (await this.userRepository.count()) > 0) {
      return;
    }
    const username = process.env.ADMIN_USERNAME || 'admin';
    await this.userRepository.save(
      this.userRepository.create({
        username,
        email: process.env.ADMIN_EMAIL || `${username}@vetclinic.local`,
        firstName: 'Clinic',
        lastName: 'Admin',
        password: await hash(password, 10),
        role: UserRole.ADMIN,
      }),
    );
    this.logger.log(`Created first administrator "${username}"`);
  }

  async login(username: string, password: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload: TokenPayload = {
      sub: user.uuid,
      username: user.username,
      role: user.role,
    };
    return {
      token: sign(payload, this.secret, { expiresIn: '12h' }),
      user: {
        uuid: user.uuid,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  verify(token: string): TokenPayload | null {
    try {
      return verify(token, this.secret) as TokenPayload;
    } catch {
      return null;
    }
  }
}
