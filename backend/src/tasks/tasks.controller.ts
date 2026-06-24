import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ROLES } from 'src/common/constants';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { TaskCreateDto } from './dto/TaskCreateDto';
import { TasksService } from './tasks.service';
import { User } from 'src/common/decorators/user.decorator';
import { TaskUpdateDto } from './dto/TaskUpdateDto';

@UseGuards(AuthGuard('jwt'))
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Create a new task within a project
  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER)
  @Post()
  async createTask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @User() user: { id: string },
    @Body() taskCreateDto: TaskCreateDto,
  ) {
    return await this.tasksService.createTask(
      projectId,
      user.id,
      taskCreateDto,
    );
  }

  // Update an existing task within a project
  @UseGuards(RoleGuard)
  @Roles(ROLES.ADMIN, ROLES.PROJECT_MANAGER)
  @Patch(':taskId')
  async updateTask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() taskUpdateDto: TaskUpdateDto,
  ) {
    return await this.tasksService.updateTask(projectId, taskId, taskUpdateDto);
  }
}
