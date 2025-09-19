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

@Controller('projects')
export class ProjectsController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectService: ClientProxy,
  ) {}

  private async validateProjectOwnership(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = (await this.findOne(projectId)) as unknown as Project;

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this project');
    }
  }

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
    @CurrentUser() user,
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
  findAll() {
    return firstValueFrom(this.projectService.send('project.getAll', {}));
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
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user,
  ) {
    await this.validateProjectOwnership(id, user.id);

    return firstValueFrom(
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
  async remove(@Param('id') id: string, @CurrentUser() user) {
    await this.validateProjectOwnership(id, user.id);

    return firstValueFrom(this.projectService.send('project.delete', id));
  }

  @Post(':id/transfer')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Transfer a project to a new owner' })
  async transfer(
    @Param('id') id: string,
    @Body() transferProjectDto: TransferProjectDto,
    @CurrentUser() user,
  ) {
    await this.validateProjectOwnership(id, user.id);

    if (transferProjectDto.toUserId === user.id) {
      throw new BadRequestException(
        'You cannot transfer a project to yourself',
      );
    }

    return await firstValueFrom(
      this.projectService.send('project.transfer', {
        id,
        toUserId: transferProjectDto.toUserId,
      }),
    );
  }
}
