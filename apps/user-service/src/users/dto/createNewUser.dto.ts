import { IsEmail, IsString, MinLength, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { IsPasswordStrong } from '@task-mgmt/shared-utils';

export class CreateNewUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @IsPasswordStrong()
  password: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;
}
