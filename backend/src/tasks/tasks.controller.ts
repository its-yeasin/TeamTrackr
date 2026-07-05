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
import { type TSystemRole } from 'src/common/constants';

import { TasksService } from './tasks.service';
import { TaskUpdateDto } from './dto/TaskUpdateDto';
import { TaskStatusUpdateDto } from './dto/TaskStatusUpdateDto';
import { User } from 'src/common/decorators/user.decorator';
import { TasksQueryDto } from './dto/TasksQueryDto';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions';

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Get all tasks
  @Permissions(PERMISSION_CODES.TASK_VIEW)
  @Get()
  async getAllTasks(
    @User()
    user: {
      id: string;
      role: TSystemRole;
    },
    @Query() query: TasksQueryDto,
  ) {
    return await this.tasksService.getAllTasks(user, query);
  }

  // Update an existing task within a project
  @Permissions(PERMISSION_CODES.TASK_UPDATE)
  @Patch(':taskId')
  async updateTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() taskUpdateDto: TaskUpdateDto,
  ) {
    return await this.tasksService.updateTask(taskId, taskUpdateDto);
  }

  // Update task status
  @Permissions(PERMISSION_CODES.TASK_STATUS_UPDATE)
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
  @Permissions(PERMISSION_CODES.TASK_ASSIGN)
  @Patch(':taskId/assign/:memberUserId')
  async assignTaskToMember(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('memberUserId', ParseUUIDPipe) memberUserId: string,
  ) {
    return await this.tasksService.assignTaskToMember(taskId, memberUserId);
  }
}
