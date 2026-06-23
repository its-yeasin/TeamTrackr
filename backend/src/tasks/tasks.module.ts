import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { ProjectMembersModule } from 'src/project-members/project-members.module';
import { TasksController } from './tasks.controller';

@Module({
  imports: [ProjectsModule, ProjectMembersModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
