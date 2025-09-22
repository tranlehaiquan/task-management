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

@Controller('projects')
export class ProjectsController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectService: ClientProxy,
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
    @CurrentUser() user,
  ) {
    const ownerId = user.id;

    const data = await firstValueFrom<
      | {
          success: true;
          data: Project;
        }
      | {
          success: false;
          message: string;
          error?: unknown;
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
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Project> {
    return await firstValueFrom(this.projectService.send<Project>('project.get', id));
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
    const project = (await this.findOne(id)) as unknown as Project;

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    if (project.ownerId !== user.id) {
      throw new ForbiddenException('You are not the owner of this project');
    }

    return firstValueFrom(
      this.projectService.send('project.update', {
        id,
        ...updateProjectDto,
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.projectsService.remove(+id);
  }
}
