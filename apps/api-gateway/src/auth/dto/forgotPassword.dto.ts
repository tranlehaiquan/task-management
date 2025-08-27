import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsPasswordStrong } from '@task-mgmt/shared-utils';

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
    description: 'New password (8-100 characters, uppercase, lowercase, number, special character)',
    example: 'MyNewSecure123!',
    minLength: 8,
    maxLength: 100,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  @IsPasswordStrong()
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
