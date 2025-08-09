import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import LoginDto from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  AuthResponseDto,
  ErrorResponseDto,
  ConflictErrorResponseDto,
} from './dto/auth-response.dto';
import { firstValueFrom } from 'rxjs';
import { User } from '@task-mgmt/database';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate a user with email and password, returns JWT token and user information',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid email or password',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await firstValueFrom(
      this.userService.send<User>('user.findUserByEmailAndPassword', {
        email,
        password,
      }),
    );

    if (!user) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = await firstValueFrom(
      this.authService.send<string, User>('auth.generateToken', user),
    );

    return {
      token,
      user,
    };
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration',
    description:
      'Register a new user account with email, password, and name. Returns JWT token and user information upon successful registration.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data (validation errors)',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
    type: ConflictErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    // check if user already exists
    const user = await firstValueFrom(
      this.userService.send<User | null, string>(
        'user.findUserByEmail',
        registerDto.email,
      ),
    );

    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const newUser = await firstValueFrom(
      this.userService.send<User, RegisterDto>('user.create', registerDto),
    );

    const token = await firstValueFrom(
      this.authService.send<string, User>('auth.generateToken', newUser),
    );

    return {
      token,
      user: newUser,
    };
  }
}
