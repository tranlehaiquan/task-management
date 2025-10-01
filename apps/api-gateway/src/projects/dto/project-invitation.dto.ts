import { ProjectRole, projectRoles } from '@task-mgmt/database';
import { IsEmail, IsEnum, IsUUID } from 'class-validator';

const rolesAddable = projectRoles.enumValues.filter((role) => role !== 'owner');

export class SendInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(rolesAddable)
  role: Exclude<ProjectRole, 'owner'>;
}
