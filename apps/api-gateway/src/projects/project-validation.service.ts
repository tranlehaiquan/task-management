import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
      const project = await firstValueFrom<Project>(
        this.projectService.send('project.get', projectId),
      );

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.ownerId !== userId) {
        throw new ForbiddenException('You are not the owner of this project');
      }

      return project;
    } catch (error) {
      // If the error is already one of our custom exceptions, re-throw it
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // If it's any other error (like microservice communication error), treat as not found
      throw new NotFoundException('Project not found');
    }
  }
}
