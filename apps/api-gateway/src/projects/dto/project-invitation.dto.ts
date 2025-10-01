import { ProjectRole, projectRoles } from '@task-mgmt/database';
import { IsEmail, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const rolesAddable = projectRoles.enumValues.filter((role) => role !== 'owner');

export class SendInvitationDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: rolesAddable })
  @IsEnum(rolesAddable)
  role: Exclude<ProjectRole, 'owner'>;
}
