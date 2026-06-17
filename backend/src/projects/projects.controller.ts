import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { ProjectCreateDto } from './dto/ProjectCreateDto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createProject(@Body() dto: ProjectCreateDto, @Req() req: Request) {
    const user = req.user as { id: string };
    const userId = user.id;
    const project = await this.projectsService.createProject(dto, userId);
    return project;
  }
}
