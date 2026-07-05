import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { User } from 'src/common/decorators/user.decorator';
import { TaskCreateDto } from './dto/TaskCreateDto';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSION_CODES } from 'src/common/constants/permissions';

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('projects/:projectId/tasks')
export class ProjectTaskController {
  constructor(private readonly tasksService: TasksService) {}

  // Create a new task within a project
  @Permissions(PERMISSION_CODES.TASK_CREATE)
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
}
