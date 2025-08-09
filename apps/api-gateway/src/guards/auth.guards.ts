import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDto;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request?.headers?.authorization) {
      return false;
    }
    const [type, token] = request.headers.authorization.split(' ');

    if (!token || type.toLowerCase() !== 'bearer') {
      return false;
    }

    try {
      const user = await firstValueFrom(
        this.authService.send<UserResponseDto, string>(
          'auth.validateToken',
          token,
        ),
      );

      request.user = user;
      return !!user;
    } catch {
      return false;
    }
  }
}
