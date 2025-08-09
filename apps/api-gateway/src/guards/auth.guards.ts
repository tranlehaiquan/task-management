import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

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
      return await firstValueFrom(
        this.authService.send<boolean, string>('auth.validateToken', token),
      );
    } catch {
      return false;
    }
  }
}
