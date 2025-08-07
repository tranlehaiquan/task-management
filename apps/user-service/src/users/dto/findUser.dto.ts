import {
  IsOptional,
  IsString,
  IsUUID,
  IsEmail,
  IsBoolean,
} from 'class-validator';

export class FindUserDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;
}

export type FindUserCriteria = {
  id?: string;
  email?: string;
  name?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
};
