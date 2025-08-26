import { Controller } from '@nestjs/common';
import { AuthService } from './auth.services';
import { MessagePattern } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('token.generateToken')
  generateToken(data: { id: string; email: string; name: string }): string {
    return this.authService.generateToken(data);
  }

  @MessagePattern('token.validateToken')
  validateToken(token: string): object | null {
    return this.authService.validateToken(token);
  }
}
