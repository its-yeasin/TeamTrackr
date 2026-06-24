import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ROLES } from 'src/common/constants';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TasksService } from './tasks.service';
import { TaskUpdateDto } from './dto/TaskUpdateDto';
import { TaskStatusUpdateDto } from './dto/TaskStatusUpdateDto';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

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
}
