import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** Only lets administrators through (use after the global AuthGuard). */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    if (user?.role !== 'admin') {
      throw new ForbiddenException('Administrators only');
    }
    return true;
  }
}
