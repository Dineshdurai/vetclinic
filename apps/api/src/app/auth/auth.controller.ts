import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private attempts = new Map<string, { count: number; reset: number }>();

  constructor(private readonly authService: AuthService) {}

  /** Max 10 login attempts per minute per IP. */
  private throttle(ip: string) {
    const now = Date.now();
    const entry = this.attempts.get(ip);
    if (!entry || entry.reset < now) {
      this.attempts.set(ip, { count: 1, reset: now + 60_000 });
      return;
    }
    if (++entry.count > 10) {
      throw new HttpException(
        'Too many attempts, try again in a minute',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Req() req: { ip: string }) {
    this.throttle(req.ip);
    return this.authService.login(dto.username, dto.password);
  }
}
