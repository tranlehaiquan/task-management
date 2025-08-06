import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
export default LoginDto;
