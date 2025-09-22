import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectValidationService } from './project-validation.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectValidationService],
})
export class ProjectsModule {}
