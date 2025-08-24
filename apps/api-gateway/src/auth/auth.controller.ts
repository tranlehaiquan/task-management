import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Get,
  Post,
  UseGuards,
  Query,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import LoginDto from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  AuthResponseDto,
  ErrorResponseDto,
  ConflictErrorResponseDto,
} from './dto/auth-response.dto';
import { EmailVerifyDto } from './dto/email-verify.dto';
import { firstValueFrom } from 'rxjs';
import { type User } from '@task-mgmt/database';
import { CurrentUser } from 'src/decorators/user.decorator';
import type { CurrentUser as CurrentUserType } from '@task-mgmt/shared-types';
import { AuthGuard } from 'src/guards/auth.guards';
import { ForgotPasswordDto } from './dto';
import { ResetPasswordDto } from './dto/forgotPassword.dto';

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

    // Update lastLoginAt timestamp (fire-and-forget)
    this.userService.emit<unknown, string>('user.updateLastLoginAt', user.id);

    // Update lastLoginAt in response immediately for consistency
    user.lastLoginAt = new Date();

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

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get the current user information',
  })
  @ApiResponse({
    status: 200,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @ApiBearerAuth('JWT-auth')
  me(@CurrentUser() user: CurrentUserType) {
    return user;
  }

  @Post('verify-email')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  async verifyEmail(@CurrentUser() user: CurrentUserType) {
    const { success, error } = await firstValueFrom<{
      success: boolean;
      error?: string;
    }>(this.userService.send('user.sendVerifyEmailUser', { userId: user.id }));

    if (!success) {
      throw new HttpException(
        error || 'Failed to send verification email',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { success, message: 'Verification email sent' };
  }

  @Post('verify-email-token')
  @ApiOperation({
    summary: 'Verify email with token',
    description:
      'Verify user email using the verification token sent to their email address',
  })
  @ApiBody({
    type: EmailVerifyDto,
    description: 'Email verification token',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Email verified successfully' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired token',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async verifyEmailToken(
    @Body() emailVerifyDto: EmailVerifyDto,
  ): Promise<{ success: boolean; message: string }> {
    const { token } = emailVerifyDto;

    const result = await firstValueFrom(
      this.userService.send<
        { success: boolean; error?: string; userId?: string },
        { token: string }
      >('user.validateEmailVerificationToken', { token }),
    );

    if (!result.success) {
      throw new HttpException(
        result.error || 'Invalid or expired verification token',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPassword: ForgotPasswordDto) {
    const { email } = forgotPassword;

    // Let user service handle the entire forgot password flow
    await firstValueFrom(
      this.userService.send<
        { success: boolean; error?: string },
        { email: string }
      >('user.forgotPassword', { email }),
    );

    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  @Get('validate-forgot-password-token')
  async validateForgotPasswordToken(
    @Query('token') token: string,
  ): Promise<{ success: boolean; error?: string }> {
    const result = await firstValueFrom(
      this.userService.send<{ success: boolean; error?: string }, string>(
        'user.validateForgotPasswordToken',
        token,
      ),
    );

    if (!result.success) {
      throw new HttpException(
        result.error || 'Invalid or expired forgot password token',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
    };
  }

  @Post('reset-password')
  async resetForgotPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ success: boolean; message?: string }> {
    return {
      success: true,
      message: 'Password reset successfully',
    };
  }
}
