import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectMembersService } from './project-members.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLES } from 'src/common/constants';

@UseGuards(AuthGuard('jwt'))
@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  //   Add a new project member
  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER)
  @Post(':memberUserId')
  async addProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberUserId', ParseUUIDPipe) memberUserId: string,
  ) {
    return this.projectMembersService.addProjectMember(projectId, memberUserId);
  }

  //   Remove a project member
  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER)
  @Delete(':memberUserId')
  async removeProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberUserId', ParseUUIDPipe) memberUserId: string,
  ) {
    return this.projectMembersService.removeProjectMember(
      projectId,
      memberUserId,
    );
  }

  //   Get all members of a project
  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.TEAM_MEMBER)
  @Get()
  async getProjectMembers(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.projectMembersService.getProjectMembers(projectId);
  }
}
