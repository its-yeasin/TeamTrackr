import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { ProjectCreateDto } from './dto/ProjectCreateDto';
import { ProjectsService } from './projects.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLES } from 'src/common/constants';
import { User } from 'src/common/decorators/user.decorator';
import { GetProjectDto } from './dto/GetProjectDto';
import { ProjectUpdateDto } from './dto/ProjectUpdateDto';

@UseGuards(AuthGuard('jwt'))
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER)
  @Post('create')
  async createProject(
    @Body() dto: ProjectCreateDto,
    @User() user: { id: string },
  ) {
    const project = await this.projectsService.createProject(dto, user.id);
    return project;
  }

  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER)
  @Put(':id')
  async updateProject(
    @Param('id') projectId: string,
    @Body() dto: ProjectUpdateDto,
  ) {
    const updatedProject = await this.projectsService.updateProject(
      projectId,
      dto,
    );
    return updatedProject;
  }

  @Get()
  async getAllProjects(
    @User() user: { id: string },
    @Query() query: GetProjectDto,
  ) {
    return await this.projectsService.getAllProjects(user.id, query);
  }
}
