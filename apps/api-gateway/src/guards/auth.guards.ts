import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}
  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if(!request?.headers?.authorization) {
      return false;
    }
    const [type, token] = (request?.headers?.authorization as string)?.split(' ');
    
    if (type !== 'Bearer') {
      return false;
    }
    
    return firstValueFrom(
      this.authService.send<boolean, string>('auth.validateToken', token),
    );
  }
}