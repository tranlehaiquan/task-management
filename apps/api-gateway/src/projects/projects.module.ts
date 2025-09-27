import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectMembersController } from './project-members.controller';
import { ProjectValidationService } from './project-validation.service';

@Module({
  controllers: [ProjectsController, ProjectMembersController],
  providers: [ProjectValidationService],
})
export class ProjectsModule {}
