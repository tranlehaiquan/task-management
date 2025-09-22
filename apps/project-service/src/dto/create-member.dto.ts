import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { projectRoles, type ProjectRole } from '@task-mgmt/database';

export class CreateMemberDto {
  @IsNotEmpty()
  @IsUUID('4')
  projectId: string;

  @IsNotEmpty()
  @IsUUID('4')
  userId: string;

  @IsOptional()
  @IsEnum(projectRoles.enumValues)
  role?: ProjectRole;
}

export class MemberDto {
  @IsNotEmpty()
  @IsUUID('4')
  userId: string;

  @IsOptional()
  @IsEnum(projectRoles.enumValues)
  role?: ProjectRole;
}

export class CreateMembersDto {
  @IsNotEmpty()
  @IsUUID('4')
  projectId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberDto)
  members: MemberDto[];
}
