import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import { TaskCreateDto } from './dto/TaskCreateDto';
import { ProjectsService } from 'src/projects/projects.service';
import { ProjectMembersService } from 'src/project-members/project-members.service';
import { tasks, TNewTask, TProjectMember } from 'src/database/schema';
import { and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: TPgDatabase,
    private readonly projectsService: ProjectsService,
    private readonly projectMembersService: ProjectMembersService,
  ) {}

  //   Create a new task of a project
  async createTask(projectId: string, userId: string, taskDto: TaskCreateDto) {
    const project = await this.projectsService.getProjectById(projectId);

    let member: TProjectMember | null = null;

    if (taskDto.assignedTo) {
      member = await this.projectMembersService.getProjectMember(
        project.id,
        taskDto.assignedTo,
      );
    }

    if (taskDto.dueDate < new Date().toISOString()) {
      // throw relevant nest exception error
      throw new BadRequestException('Due date cannot be in the past');
    }

    const [existingTask] = await this.db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, project.id),
          eq(tasks.title, taskDto.title),
          isNull(tasks.deletedAt),
        ),
      );

    if (existingTask) {
      throw new ConflictException(
        'A task with the same title already exists in this project',
      );
    }

    const payload: TNewTask = {
      title: taskDto.title,
      description: taskDto.description,
      createdBy: userId,
      projectId: project.id,
      priority: taskDto.priority,
      dueDate: new Date(taskDto.dueDate),
      ...(member ? { assignedTo: member.userId } : {}),
    };

    const [createdTask] = await this.db
      .insert(tasks)
      .values(payload)
      .returning();

    return {
      id: createdTask.id,
      title: createdTask.title,
      description: createdTask.description,
      projectId: createdTask.projectId,
      assignedTo: createdTask.assignedTo,
      priority: createdTask.priority,
      status: createdTask.status,
      dueDate: createdTask.dueDate,
      createdAt: createdTask.createdAt,
      updatedAt: createdTask.updatedAt,
    };
  }
}
