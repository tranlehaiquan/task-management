import { ProjectRole, projectRoles } from '@task-mgmt/database';
import { IsEmail, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const rolesAddable = projectRoles.enumValues.filter((role) => role !== 'owner');

export class SendInvitationDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: rolesAddable })
  @IsEnum(rolesAddable)
  role: Exclude<ProjectRole, 'owner'>;
}
