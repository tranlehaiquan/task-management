import { ApiProperty } from '@nestjs/swagger';
import { projectRoles, type ProjectRole } from '@task-mgmt/database';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

const rolesAddable = projectRoles.enumValues.filter((role) => role !== 'owner');

class AddProjectMemberDto {
  @ApiProperty({
    description: 'The ID of the user to add to the project',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'The role of the user in the project',
    example: 'member',
  })
  @IsOptional()
  @IsEnum(rolesAddable)
  role?: Exclude<ProjectRole, 'owner'>;
}

class UpdateProjectMemberRoleDto {
  @ApiProperty({
    description: 'The role of the user in the project',
    example: 'member',
  })
  @IsEnum(rolesAddable)
  role?: Exclude<ProjectRole, 'owner'>;
}

export { AddProjectMemberDto, UpdateProjectMemberRoleDto };
