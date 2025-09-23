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
      const response = await firstValueFrom<{
        success?: boolean;
        data?: Project;
        error?: 'NOT_FOUND' | 'FORBIDDEN' | 'INTERNAL_ERROR';
        message?: string;
      }>(
        this.projectService.send('project.validateOwnership', {
          projectId,
          userId,
        }),
      );

      if (response.error === 'NOT_FOUND') {
        throw new NotFoundException('Project not found');
      }

      if (response.error === 'FORBIDDEN') {
        throw new ForbiddenException('You are not the owner of this project');
      }

      if (response.error === 'INTERNAL_ERROR') {
        throw new NotFoundException('Project not found');
      }

      if (response.success && response.data) {
        return response.data;
      }

      // Fallback for unexpected response format
      throw new NotFoundException('Project not found');
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
