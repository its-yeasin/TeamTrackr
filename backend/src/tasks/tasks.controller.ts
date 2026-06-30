import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ROLES, type TUserRole } from 'src/common/constants';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TasksService } from './tasks.service';
import { TaskUpdateDto } from './dto/TaskUpdateDto';
import { TaskStatusUpdateDto } from './dto/TaskStatusUpdateDto';
import { User } from 'src/common/decorators/user.decorator';
import { TasksQueryDto } from './dto/TasksQueryDto';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Get all tasks
  @Get()
  async getAllTasks(
    @User()
    user: {
      id: string;
      role: TUserRole;
    },
    @Query() query: TasksQueryDto,
  ) {
    return await this.tasksService.getAllTasks(user, query);
  }

  // Update an existing task within a project
  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER)
  @Patch(':taskId')
  async updateTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() taskUpdateDto: TaskUpdateDto,
  ) {
    return await this.tasksService.updateTask(taskId, taskUpdateDto);
  }

  // Update task status
  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER)
  @Patch(':taskId/status')
  async updateTaskStatus(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() taskStatusUpdateDto: TaskStatusUpdateDto,
  ) {
    return await this.tasksService.updateTaskStatus(
      taskId,
      taskStatusUpdateDto.status,
    );
  }

  // Assign a task to a project member
  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER)
  @Patch(':taskId/assign/:memberUserId')
  async assignTaskToMember(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('memberUserId', ParseUUIDPipe) memberUserId: string,
  ) {
    return await this.tasksService.assignTaskToMember(taskId, memberUserId);
  }
}
