import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import { TaskCreateDto } from './dto/TaskCreateDto';
import { ProjectsService } from 'src/projects/projects.service';
import { ProjectMembersService } from 'src/project-members/project-members.service';
import { tasks, TNewTask, TProjectMember, TTask } from 'src/database/schema';
import { and, eq, isNull, ne } from 'drizzle-orm';
import { TaskUpdateDto } from './dto/TaskUpdateDto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: TPgDatabase,
    private readonly projectsService: ProjectsService,
    private readonly projectMembersService: ProjectMembersService,
  ) {}

  // Validate task assignment
  private async validateTaskAssignment(
    projectId: string,
    assignedTo?: string,
  ): Promise<TProjectMember | null> {
    if (!assignedTo) return null;

    return await this.projectMembersService.getProjectMember(
      projectId,
      assignedTo,
    );
  }

  // Validate due date
  private validateDueDate(dueDate: string): void {
    if (!dueDate) return;

    const dueDateObj = new Date(dueDate);
    const now = new Date();

    if (dueDateObj < now) {
      throw new BadRequestException('Due date cannot be in the past');
    }
  }

  // task return mapping function
  private mapTaskResponse(task: TTask) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assignedTo: task.assignedTo,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  // Ensure task title is unique within the project
  private async ensureTitleUnique(
    projectId: string,
    title: string,
    excludeTaskId?: string,
  ): Promise<void> {
    if (!title) return;

    const [existingTask] = await this.db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, projectId),
          eq(tasks.title, title),
          isNull(tasks.deletedAt),
          excludeTaskId ? ne(tasks.id, excludeTaskId) : undefined,
        ),
      );

    if (existingTask) {
      throw new ConflictException(
        'A task with the same title already exists in this project',
      );
    }
  }

  // Get Task by ID
  async getTaskById(taskId: string): Promise<TTask> {
    const [task] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)));

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  //   Create a new task of a project
  async createTask(projectId: string, userId: string, taskDto: TaskCreateDto) {
    const project = await this.projectsService.getProjectById(projectId);

    const [member] = await Promise.all([
      this.validateTaskAssignment(projectId, taskDto.assignedTo),
      this.ensureTitleUnique(projectId, taskDto.title),
    ]);

    this.validateDueDate(taskDto.dueDate);

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

    return this.mapTaskResponse(createdTask);
  }

  // Update an existing task of a project
  async updateTask(
    projectId: string,
    taskId: string,
    taskUpdateDto: TaskUpdateDto,
  ) {
    // Ensure at least one field is provided for update
    if (Object.keys(taskUpdateDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const task = await this.getTaskById(taskId);

    if (task.projectId !== projectId) {
      throw new BadRequestException(
        'Task does not belong to the specified project',
      );
    }

    // If title is being updated, ensure it's unique within the project
    await this.ensureTitleUnique(task.projectId, taskUpdateDto.title, taskId);

    // Due date can't be in the past
    this.validateDueDate(taskUpdateDto.dueDate);

    const payload: Partial<TNewTask> = {
      title: taskUpdateDto.title,
      description: taskUpdateDto.description,
      priority: taskUpdateDto.priority,
      ...(taskUpdateDto.dueDate
        ? { dueDate: new Date(taskUpdateDto.dueDate) }
        : {}),
    };

    const [updatedTask] = await this.db
      .update(tasks)
      .set(payload)
      .where(and(eq(tasks.projectId, task.projectId), eq(tasks.id, taskId)))
      .returning();

    return this.mapTaskResponse(updatedTask);
  }
}
