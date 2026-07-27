import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectCreateDto } from './dto/ProjectCreateDto';
import { ProjectsService } from './projects.service';
import { User } from 'src/common/decorators/user.decorator';
import { GetProjectDto } from './dto/GetProjectDto';
import { ProjectUpdateDto } from './dto/ProjectUpdateDto';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions';
import type { JwtPayload } from 'src/auth/strategy/jwt.strategy';

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  async createProject(
    @Body() dto: ProjectCreateDto,
    @User() user: { id: string },
  ) {
    const project = await this.projectsService.createProject(dto, user.id);
    return project;
  }

  @Permissions(PERMISSION_CODES.PROJECT_UPDATE)
  @Put(':projectId')
  async updateProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: ProjectUpdateDto,
  ) {
    const updatedProject = await this.projectsService.updateProject(
      projectId,
      dto,
    );
    return updatedProject;
  }

  @Permissions(PERMISSION_CODES.PROJECT_DELETE)
  @Delete(':projectId')
  async deleteProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    await this.projectsService.deleteProject(projectId);
    return { message: 'Project deleted successfully' };
  }

  @Get()
  async getAllProjects(
    @User() user: JwtPayload,
    @Query() query: GetProjectDto,
  ) {
    return await this.projectsService.getAllProjects(user, query);
  }

  @Permissions(PERMISSION_CODES.PROJECT_VIEW)
  @Get(':projectId')
  async getProjectById(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return await this.projectsService.getProjectById(projectId);
  }
}
