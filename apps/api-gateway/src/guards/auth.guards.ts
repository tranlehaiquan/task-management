import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}
  
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if(!request?.headers?.authorization) {
      return false;
    }
    const [type, token] = (request?.headers?.authorization as string)?.split(' ');
    
    if (type.toLowerCase() !== 'bearer') {
      return false;
    }
    
    try {
      return await firstValueFrom(
        this.authService.send<boolean, string>('auth.validateToken', token),
      );
    } catch (error) {
      // Handle transport errors gracefully (e.g., auth service down or timeout)
      // Return false to ensure client receives 401 instead of 500
      return false;
    }
  }
}