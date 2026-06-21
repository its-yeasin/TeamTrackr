import { Module } from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { ProjectMembersController } from './project-members.controller';

@Module({
  imports: [ProjectsModule],
  providers: [ProjectMembersService],
  controllers: [ProjectMembersController],
})
export class ProjectMembersModule {}
