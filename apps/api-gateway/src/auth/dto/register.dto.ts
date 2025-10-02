import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPasswordStrong } from '@task-mgmt/shared-utils';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (8-100 characters with at least one number)',
    example: 'password123',
    minLength: 8,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @IsPasswordStrong()
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
