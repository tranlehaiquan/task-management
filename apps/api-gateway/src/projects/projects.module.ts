import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectMembersController } from './project-members.controller';
import { ProjectValidationService } from './project-validation.service';
import { ProjectInvitationsController } from './project-invitations.controller';

@Module({
  controllers: [
    ProjectsController,
    ProjectMembersController,
    ProjectInvitationsController,
  ],
  providers: [ProjectValidationService],
})
export class ProjectsModule {}
