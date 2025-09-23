import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { type NewProject } from '@task-mgmt/database';
import { TransferProjectDto } from './dto/transfer-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetAllProjectsDto } from './dto/get-all-projects.dto';
import { CreateMemberDto } from './dto/create-member.dto';

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
  async createProject(data: {
    name: string;
    description?: string;
    slug?: string;
    ownerId: string;
  }) {
    try {
      const result = await this.appService.create(data);
      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create project';
      return {
        success: false,
        message,
      };
    }
  }

  @MessagePattern('project.findById')
  findProjectById(id: string) {
    return this.appService.findById(id);
  }

  @MessagePattern('project.getAll')
  getAllProjects(payload: GetAllProjectsDto) {
    return this.appService.getAll(payload.page, payload.limit);
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
  updateProject(data: UpdateProjectDto) {
    return this.appService.updateProject(data);
  }

  @MessagePattern('project.transfer')
  transferProject(@Payload() data: TransferProjectDto) {
    return this.appService.transferProject(data.id, data.toUserId);
  }

  @MessagePattern('member.create')
  createMember(data: CreateMemberDto) {
    return this.appService.createMembers({
      projectId: data.projectId,
      members: [{ userId: data.userId, role: data.role }],
    });
  }

  @MessagePattern('project.validateOwnership')
  async validateOwnership(
    @Payload() data: { projectId: string; userId: string },
  ) {
    try {
      const project = await this.appService.validateProjectOwnership(
        data.projectId,
        data.userId,
      );

      return project;
    } catch (error: unknown) {
      console.error(error);
      return {
        success: false,
        code: 'INTERNAL_ERROR',
      };
    }
  }
}
