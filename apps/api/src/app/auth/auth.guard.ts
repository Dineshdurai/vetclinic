import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

/** Global guard: every route needs a valid Bearer token unless marked @Public(). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const [type, token] = (request.headers.authorization || '').split(' ');
    const payload = type === 'Bearer' ? this.authService.verify(token) : null;
    if (!payload) {
      throw new UnauthorizedException();
    }
    request.user = payload;
    return true;
  }
}
