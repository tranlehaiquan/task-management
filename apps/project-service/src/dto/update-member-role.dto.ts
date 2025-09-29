import { IsUUID, IsNotEmpty, IsEnum } from 'class-validator';
import { projectRoles, type ProjectRole } from '@task-mgmt/database';

const rolesAddable = projectRoles.enumValues.filter((role) => role !== 'owner');

export class UpdateMemberRoleDto {
  @IsNotEmpty()
  @IsUUID('4')
  projectId: string;

  @IsNotEmpty()
  @IsUUID('4')
  memberId: string;

  @IsNotEmpty()
  @IsEnum(rolesAddable)
  role?: Exclude<ProjectRole, 'owner'>;
}
