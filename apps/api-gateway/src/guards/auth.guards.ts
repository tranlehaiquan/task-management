import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import type { CurrentUser, UserJWTPayload } from '@task-mgmt/shared-types';

interface AuthenticatedRequest extends Request {
  user?: CurrentUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request?.headers?.authorization) {
      return false;
    }
    const [type, token] = request.headers.authorization.split(' ');

    if (!token || type.toLowerCase() !== 'bearer') {
      return false;
    }

    try {
      const jwtPayload = await firstValueFrom(
        this.authService.send<UserJWTPayload | null, string>(
          'auth.validateToken',
          token,
        ),
      );

      if (!jwtPayload || !jwtPayload.id) {
        return false;
      }

      const userData = await firstValueFrom(
        this.userService.send<CurrentUser | null, string>(
          'user.findById',
          jwtPayload.id,
        ),
      );

      // TODO: add !userData.isActive condition latter
      if (!userData) {
        return false;
      }

      // Step 3: Attach sanitized user object to request
      request.user = userData;
      return true;
    } catch {
      return false;
    }
  }
}
