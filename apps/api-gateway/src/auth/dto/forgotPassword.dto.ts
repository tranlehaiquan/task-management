import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address for password reset',
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'password123',
    minLength: 8,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    description: 'Password reset token',
    example: 'resetToken123',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  token: string;
}
