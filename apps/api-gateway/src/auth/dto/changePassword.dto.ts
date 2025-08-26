import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'passwordsNotEqual', async: false })
export class PasswordsNotEqual implements ValidatorConstraintInterface {
  validate(newPassword: string, args: ValidationArguments) {
    const object = args.object as ChangePasswordDto;
    return object.currentPassword !== newPassword;
  }

  defaultMessage() {
    return 'New password must not be the same as current password';
  }
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty({
    description: 'Current password of the user',
    example: 'currentPassword123',
  })
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Validate(PasswordsNotEqual)
  @ApiProperty({
    description: 'New password of the user',
    example: 'newPassword123',
  })
  newPassword: string;
}
