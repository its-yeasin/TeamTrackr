import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { ProjectMembersModule } from 'src/project-members/project-members.module';
import { TasksController } from './tasks.controller';
import { ProjectTaskController } from './project-task.controller';

@Module({
  imports: [ProjectsModule, ProjectMembersModule],
  providers: [TasksService],
  controllers: [TasksController, ProjectTaskController],
})
export class TasksModule {}
