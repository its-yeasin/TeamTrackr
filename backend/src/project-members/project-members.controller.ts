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
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions';
import { ProjectMemberAddDto } from './dto/ProjectMemberAddDto';

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  //   Add a new project member
  @Permissions(PERMISSION_CODES.PROJECT_MEMBER_ADD)
  @Post('')
  async addProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() memberAddDto: ProjectMemberAddDto,
  ) {
    return this.projectMembersService.addProjectMember(projectId, memberAddDto);
  }

  //   Remove a project member
  @Permissions(PERMISSION_CODES.PROJECT_MEMBER_REMOVE)
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
  @Get()
  async getProjectMembers(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.projectMembersService.getProjectMembers(projectId);
  }
}
