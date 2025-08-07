import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
export default LoginDto;
