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
import { TASK_STATUSES, type TTaskStatus } from 'src/common/constants';

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

  // Validate status transition
  private validateStatusTransition(current: TTaskStatus, next: TTaskStatus) {
    const transitions: Record<TTaskStatus, TTaskStatus[]> = {
      TODO: ['IN_PROGRESS'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: [],
    };

    if (!transitions[current].includes(next)) {
      throw new BadRequestException(
        `Invalid status transition from ${current} to ${next}`,
      );
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

    // Validate task assignment and ensure title uniqueness
    const [member] = await Promise.all([
      this.validateTaskAssignment(projectId, taskDto.assignedTo),
      this.ensureTitleUnique(projectId, taskDto.title),
    ]);

    // Due date can't be in the past
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

    // Insert the new task into the database and return the created task
    const [createdTask] = await this.db
      .insert(tasks)
      .values(payload)
      .returning();

    return this.mapTaskResponse(createdTask);
  }

  // Update an existing task of a project
  async updateTask(taskId: string, taskUpdateDto: TaskUpdateDto) {
    const task = await this.getTaskById(taskId);

    // If title is being updated, ensure it's unique within the project
    await this.ensureTitleUnique(task.projectId, taskUpdateDto.title, taskId);

    // Due date can't be in the past
    this.validateDueDate(taskUpdateDto.dueDate);

    const payload: Partial<TNewTask> = {
      title: taskUpdateDto.title,
      description: taskUpdateDto.description,
      priority: taskUpdateDto.priority,
      updatedAt: new Date(),
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

  // Update task status
  async updateTaskStatus(taskId: string, status: TTaskStatus) {
    // Ensure the task exists before updating its status
    const task = await this.getTaskById(taskId);

    // Validate the status transition TODO > IN_PROGRESS > COMPLETED
    this.validateStatusTransition(task.status, status);

    const [updatedTask] = await this.db
      .update(tasks)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return this.mapTaskResponse(updatedTask);
  }

  // Assign a task to a project member
  async assignTaskToMember(taskId: string, memberUserId: string) {
    const task = await this.getTaskById(taskId);

    if (task.status === TASK_STATUSES.COMPLETED) {
      throw new BadRequestException('Cannot assign a completed task');
    }

    // Check user is a member of the project
    const member = await this.validateTaskAssignment(
      task.projectId,
      memberUserId,
    );

    // Check already assigned to the same member
    if (task.assignedTo === member.userId) {
      throw new ConflictException('Task is already assigned to this member');
    }

    const [updatedTask] = await this.db
      .update(tasks)
      .set({
        assignedTo: member.userId,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return this.mapTaskResponse(updatedTask);
  }
}
