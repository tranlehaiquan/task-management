import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import LoginDto from './dto/login.dto';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<any> {}
}
