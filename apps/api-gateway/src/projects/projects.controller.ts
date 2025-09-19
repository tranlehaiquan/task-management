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
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from 'src/guards/auth.guards';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiOperation } from '@nestjs/swagger';

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
  create(@Body() createProjectDto: CreateProjectDto) {
    return firstValueFrom(
      this.projectService.send('project.create', createProjectDto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  findAll() {
    return firstValueFrom(this.projectService.send('project.getAll', {}));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string) {
    // return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    // return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.projectsService.remove(+id);
  }
}
