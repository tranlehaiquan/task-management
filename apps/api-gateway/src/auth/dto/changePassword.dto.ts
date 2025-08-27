import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { IsPasswordStrong } from '@task-mgmt/shared-utils';

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
  @ApiProperty({
    description: 'Current password of the user',
    example: 'MyCurrentPass123!',
  })
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @IsPasswordStrong()
  @Validate(PasswordsNotEqual)
  @ApiProperty({
    description: 'New password (8-100 characters, uppercase, lowercase, number, special character)',
    example: 'MyNewSecure456!',
  })
  newPassword: string;
}
