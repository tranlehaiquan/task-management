import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { type NewProject, type UpdateProject } from '@task-mgmt/database';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('project.ping')
  ping() {
    return {
      message: 'Project Service is alive',
    };
  }

  @MessagePattern('project.create')
  createProject(data: NewProject) {
    return this.appService.create(data);
  }

  @MessagePattern('project.findById')
  findProjectById(id: string) {
    return this.appService.findById(id);
  }

  @MessagePattern('project.getAll')
  getAllProjects(page?: number, limit?: number) {
    console.log('page, limit', page, limit);
    return this.appService.getAll(page, limit);
  }

  @MessagePattern('project.get')
  getProject(id: string) {
    return this.appService.findById(id);
  }

  @MessagePattern('project.delete')
  deleteProject(id: string) {
    return this.appService.deleteProject(id);
  }

  @MessagePattern('project.update')
  updateProject(data: UpdateProject) {
    return this.appService.updateProject(data);
  }

  @MessagePattern('project.transfer')
  transferProject(projectId: string, toUserId: string) {
    return {
      projectId,
      toUserId,
    };
  }
}
