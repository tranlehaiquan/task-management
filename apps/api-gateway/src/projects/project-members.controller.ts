import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Inject,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/user.decorator';
import type { CurrentUser as CurrentUserType } from '@task-mgmt/shared-types';
import { AuthGuard } from 'src/guards/auth.guards';
import { ProjectValidationService } from './project-validation.service';
import {
  AddProjectMemberDto,
  UpdateProjectMemberRoleDto,
} from './dto/project-members.dto';

@ApiTags('Project Members')
@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectService: ClientProxy,
    private readonly projectValidationService: ProjectValidationService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all members of a project' })
  async getProjectMembers(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ userId: string; role: string }[]> {

    await this.projectValidationService.validateProjectMemberRole(
      projectId,
      user.id,
    );

    return firstValueFrom<{ userId: string; role: string }[]>(
      this.projectService.send('member.getByProject', {
        projectId,
      }),
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a member to a project' })
  async addProjectMember(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @Body() body: AddProjectMemberDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ success: boolean; message: string }> {
    await this.projectValidationService.validateProjectMemberRole(
      projectId,
      user.id,
      ['owner', 'admin'],
    );

    return firstValueFrom<{ success: boolean; message: string }>(
      this.projectService.send('member.create', {
        projectId,
        userId: body.userId,
        role: body.role,
      }),
    );
  }

  @Put(':memberId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a member role in a project' })
  async updateProjectMemberRole(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @Param('memberId', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @Body() body: UpdateProjectMemberRoleDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ success: boolean; message: string }> {
    await this.projectValidationService.validateProjectMemberRole(
      projectId,
      user.id,
      ['owner', 'admin'],
    );

    return firstValueFrom<{ success: boolean; message: string }>(
      this.projectService.send('member.updateRole', {
        projectId,
        memberId,
        role: body.role,
      }),
    );
  }

  @Delete(':memberId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove a member from a project' })
  async removeProjectMember(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @Param('memberId', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ success: boolean; message: string }> {
    await this.projectValidationService.validateProjectMemberRole(
      projectId,
      user.id,
      ['owner', 'admin'],
    );

    return firstValueFrom<{ success: boolean; message: string }>(
      this.projectService.send('member.delete', {
        projectId,
        memberId,
      }),
    );
  }
}
