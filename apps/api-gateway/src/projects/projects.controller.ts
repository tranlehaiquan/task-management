import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
  BadRequestException,
  ForbiddenException,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from 'src/guards/auth.guards';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/user.decorator';
import { type Project } from '@task-mgmt/database';
import { TransferProjectDto } from './dto/transfer-project.dto';
import type { CurrentUser as CurrentUserType } from '@task-mgmt/shared-types';
import { ProjectValidationService } from './project-validation.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectService: ClientProxy,
    private readonly projectValidationService: ProjectValidationService,
  ) {}

  @Get('ping')
  async ping() {
    return await firstValueFrom(this.projectService.send('project.ping', {}));
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new project' })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const ownerId = user.id;

    const data = await firstValueFrom<
      | {
          success: true;
          data: any;
        }
      | {
          success: false;
          message: string;
          error: any;
        }
    >(
      this.projectService.send('project.create', {
        ...createProjectDto,
        ownerId,
      }),
    );

    if (!data.success) {
      throw new BadRequestException(data.message || 'Failed to create project');
    }

    return data.data;
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return firstValueFrom(
      this.projectService.send('project.getAll', { page, limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(this.projectService.send('project.get', id));
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a project' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<Project> {
    await this.projectValidationService.validateProjectOwnership(id, user.id);

    return firstValueFrom<Project>(
      this.projectService.send('project.update', {
        id,
        ...updateProjectDto,
      }),
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a project' })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ success: boolean; message: string }> {
    await this.projectValidationService.validateProjectOwnership(id, user.id);

    return firstValueFrom<{ success: boolean; message: string }>(
      this.projectService.send('project.delete', id)
    );
  }

  @Post(':id/transfer')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Transfer a project to a new owner' })
  async transfer(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() transferProjectDto: TransferProjectDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<Project> {
    await this.projectValidationService.validateProjectOwnership(id, user.id);

    if (transferProjectDto.toUserId === user.id) {
      throw new BadRequestException(
        'You cannot transfer a project to yourself',
      );
    }

    return firstValueFrom<Project>(
      this.projectService.send<Project>('project.transfer', [
        id,
        transferProjectDto.toUserId,
      ]),
    );
  }

  // GET    /api/projects/:id/members        - List project members
  // POST   /api/projects/:id/members/invite - Invite user(s) to project
  // PUT    /api/projects/:id/members/:userId - Update member role
  // DELETE /api/projects/:id/members/:userId - Remove member
  // POST   /api/projects/:id/members/bulk-invite - Bulk invite users
}
