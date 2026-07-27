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
import { and, asc, count, eq, isNull, ne } from 'drizzle-orm';
import { TaskUpdateDto } from './dto/TaskUpdateDto';
import {
  TASK_STATUSES,
  type TSystemRole,
  type TTaskStatus,
} from 'src/common/constants';
import { TasksQueryDto } from './dto/TasksQueryDto';
import { TaskResponseDto } from './dto/TaskResponseDto';
import { TaskQueryBuilder } from './task-query.builder';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: TPgDatabase,
    private readonly projectsService: ProjectsService,
    private readonly projectMembersService: ProjectMembersService,
  ) {}

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

  // Get all tasks
  async getAllTasks(
    user: {
      id: string;
      role: TSystemRole;
    },
    query: TasksQueryDto,
  ): Promise<TaskResponseDto> {
    const page = Math.max(query.page ?? 1, 1); // Ensure page is at least 1
    const limit = Math.min(Math.max(query.limit ?? 30, 1), 100); // Ensure limit is between 1 and 100

    const whereClause = new TaskQueryBuilder(user, query, this.db).build();

    const [tasksList, [{ totalCount }]] = await Promise.all([
      this.db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          projectId: tasks.projectId,
          assignedTo: tasks.assignedTo,
          priority: tasks.priority,
          status: tasks.status,
          dueDate: tasks.dueDate,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
        })
        .from(tasks)
        .where(whereClause)
        .orderBy(asc(tasks.dueDate))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db
        .select({
          totalCount: count(),
        })
        .from(tasks)
        .where(whereClause),
    ]);

    return {
      data: tasksList,
      pagination: {
        page,
        limit,
        total: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / limit),
      },
    };
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

    // Check already assigned to the same member
    if (task.assignedTo === memberUserId) {
      throw new ConflictException('Task is already assigned to this member');
    }

    // Check user is a member of the project
    const member = await this.projectMembersService.getProjectMember(
      task.projectId,
      memberUserId,
    );

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

  async removeTask(taskId: string): Promise<void> {
    // Check if the task exists before attempting to delete it
    await this.getTaskById(taskId);

    // Soft delete the task by setting its deletedAt timestamp
    await this.db
      .update(tasks)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));
  }

  /* -------Helper classes----- */
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
}
