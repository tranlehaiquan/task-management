import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { ProjectMember, ProjectRole, Project } from '@task-mgmt/database';

@Injectable()
export class ProjectValidationService {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectService: ClientProxy,
  ) {}

  async validateProjectOwnership(
    projectId: string,
    userId: string,
  ): Promise<Project> {
    let response:
      | {
          success: false;
          code: 'PROJECT_NOT_FOUND' | 'FORBIDDEN' | 'INTERNAL_ERROR';
        }
      | {
          success: true;
          project: Project;
        };

    try {
      response = await firstValueFrom<
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
    } catch (error) {
      // Log the original transport/broker error for debugging
      console.error('Project service communication error:', error);
      throw new ServiceUnavailableException(
        'Project service is temporarily unavailable due to communication failure',
      );
    }

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
  }

  async validateProjectMemberRole(
    projectId: string,
    userId: string,
    requiredRoles?: ProjectRole[],
  ): Promise<ProjectMember> {
    let member: ProjectMember | null;

    try {
      member = await firstValueFrom<ProjectMember | null>(
        this.projectService.send('member.getByProjectIdAndUserId', {
          projectId,
          userId,
        }),
      );
    } catch (error) {
      // Log the original transport/broker error for debugging
      console.error('Project service communication error:', error);
      throw new ServiceUnavailableException(
        'Project service is temporarily unavailable due to communication failure',
      );
    }

    if (!member) {
      throw new NotFoundException('You are not a member of this project');
    }

    if (requiredRoles && !requiredRoles.includes(member.role)) {
      throw new ForbiddenException(
        'You do not have the required role to perform this action',
      );
    }

    return member;
  }
}
