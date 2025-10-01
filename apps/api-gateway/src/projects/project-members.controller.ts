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
  BadRequestException,
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
import { SendInvitationDto } from './dto/project-invitation.dto';
import { ProjectInvitation } from '@task-mgmt/database';

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

    const result = await firstValueFrom<{ success: boolean; message: string }>(
      this.projectService.send('member.create', {
        projectId,
        userId: body.userId,
        role: body.role,
      }),
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return result;
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

  // POST	/projects/:id/invitations	Send invitation
  @Post(':id/invitations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send invitation to a user' })
  async sendInvitation(
    @Param('projectId', new ParseUUIDPipe({ version: '4' })) projectId: string,
    @Body() body: SendInvitationDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      id: string;
    };
  }> {
    await this.projectValidationService.validateProjectMemberRole(
      projectId,
      user.id,
      ['owner', 'admin'],
    );

    const projectInvited = await firstValueFrom<
      | {
          success: true;
          data: ProjectInvitation;
        }
      | {
          success: false;
          message: string;
        }
    >(
      this.projectService.send('member.sendInvitation', {
        projectId,
        role: body.role,
        email: body.email,
        invitedBy: user.id,
      }),
    );

    if (!projectInvited.success) {
      throw new BadRequestException(projectInvited.message);
    }

    return {
      success: true,
      data: {
        id: projectInvited.data.id,
      },
      message: 'Invitation sent successfully',
    };
  }

  // GET	/projects/:id/invitations	List project invitations
  // POST	/invitations/accept/:token	Accept invitation (public)
  // POST	/invitations/decline/:token	Decline invitation (public)
}
