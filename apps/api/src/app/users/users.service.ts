import { User } from '@app/database';
import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * UsersService class.
 */
@Injectable()
export class UsersService {
  /**
   * This is the constructor method.
   *
   * @param {Repository} userRepository - injects a repository.
   */
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  /**
   * This method creates a new user.
   *
   * @param {CreateUserDto} createUserDto  - contains the user's information.
   * @returns - the new user.
   */
  async create(createUserDto: CreateUserDto) {
    const dto = { ...createUserDto, password: await hash(createUserDto.password, 10) };
    let user = createUserDto.uuid
      ? await this.userRepository.findOneBy({ uuid: createUserDto.uuid })
      : null;

    if (!user) {
      user = this.userRepository.create(dto);
    } else {
      this.userRepository.merge(user, dto);
    }

    return this.stripPassword(await this.userRepository.save(user));
  }

  /**
   * This method gets all users.
   *
   * @returns - all users.
   */
  async findAll() {
    const [result, total] = await this.userRepository.findAndCount({
      order: { createdAt: 'DESC' },
    });

    return {
      data: result,
      count: total,
    };
  }

  /**
   * This method gets an user.
   *
   * @param {string} uuid - the user's id.
   * @returns - the user.
   */
  async findOne(uuid: string) {
    const user = await this.userRepository.findOneBy({ uuid });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  /**
   * This method updates an user.
   *
   * @param {string} uuid - the user's id.
   * @param {UpdateUserDto} updateCompanyDto - contains the user's information.
   * @returns - the user.
   */
  async update(uuid: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ uuid });

    if (!user) {
      throw new NotFoundException();
    }

    const { password, ...rest } = updateUserDto;
    this.userRepository.merge(user, rest);
    if (password) {
      user.password = await hash(password, 10);
    }

    return this.stripPassword(await this.userRepository.save(user));
  }

  /**
   * This method deletes an user
   *
   * @param {string} uuid - the user's id.
   * @returns - the operation result.
   */
  async remove(uuid: string) {
    return await this.userRepository.softDelete(uuid);
  }

  private stripPassword(user: User) {
    delete user.password;
    return user;
  }
}
