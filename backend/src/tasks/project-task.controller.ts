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
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLES } from 'src/common/constants';
import { User } from 'src/common/decorators/user.decorator';
import { TaskCreateDto } from './dto/TaskCreateDto';

@UseGuards(AuthGuard('jwt'))
@Controller('projects/:projectId/tasks')
export class ProjectTaskController {
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
}
