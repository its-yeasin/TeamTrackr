import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { ProjectMembersModule } from 'src/project-members/project-members.module';

@Module({
  imports: [ProjectsModule, ProjectMembersModule],
  providers: [TasksService],
})
export class TasksModule {}
