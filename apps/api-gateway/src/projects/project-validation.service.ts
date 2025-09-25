import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { type Project } from '@task-mgmt/database';

@Injectable()
export class ProjectValidationService {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectService: ClientProxy,
  ) {}

  async validateProjectOwnership(
    projectId: string,
    userId: string,
  ): Promise<Project> {
    try {
      const response = await firstValueFrom<
        | {
            success: false;
            code: 'PROJECT_NOT_FOUND' | 'FORBIDDEN' | 'INTERNAL_ERROR';
          }
        | {
            success: true;
            project: Project;
          }
      >(
        this.projectService.send('project.validateOwnership', {
          projectId,
          userId,
        }),
      );

      if (response.success) {
        return response.project;
      }

      if (response.code === 'PROJECT_NOT_FOUND') {
        throw new NotFoundException('Project not found');
      }

      if (response.code === 'FORBIDDEN') {
        throw new ForbiddenException('You are not the owner of this project');
      }

      throw new ServiceUnavailableException(
        'Project service is temporarily unavailable',
      );
    } catch (error) {
      // fallback in case can't connect to project service
      throw new ServiceUnavailableException(
        'Project service is temporarily unavailable',
      );
    }
  }
}
