import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import { ProjectCreateDto } from './dto/ProjectCreateDto';
import {
  projectMembers,
  projects,
  tasks,
  TNewProject,
  TNewTask,
  TProject,
  users,
} from 'src/database/schema';
import { and, eq, gte, ilike, inArray, isNull, lte, or } from 'drizzle-orm';
import { GetProjectDto } from './dto/GetProjectDto';
import { TProjectStatus } from 'src/common/constants';
import { ProjectUpdateDto } from './dto/ProjectUpdateDto';
import { TaskCreateDto } from 'src/tasks/dto/TaskCreateDto';

@Injectable()
export class ProjectsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: TPgDatabase) {}

  // Create a new project
  async createProject(
    dto: ProjectCreateDto,
    userId: string,
  ): Promise<TProject> {
    const payload: TNewProject = {
      name: dto.name,
      description: dto.description,
      status: dto.status || 'ACTIVE',
      deadline: new Date(dto.deadline),
      createdBy: userId,
    };

    // Store project data in the database
    const [newProject] = await this.db
      .insert(projects)
      .values(payload)
      .returning();

    return newProject;
  }

  // Update an existing project
  async updateProject(
    projectId: string,
    dto: ProjectUpdateDto,
  ): Promise<TProject> {
    const [existingProject] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId)));

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    const payload: Partial<TNewProject> = {};

    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.status !== undefined) payload.status = dto.status;
    if (dto.deadline !== undefined) payload.deadline = new Date(dto.deadline);

    // Always update the updatedAt
    payload.updatedAt = new Date();

    // Store project data in the database
    const [updatedProject] = await this.db
      .update(projects)
      .set(payload)
      .where(eq(projects.id, projectId))
      .returning();

    return updatedProject;
  }

  // Get all projects
  async getAllProjects(
    userId: string,
    query: GetProjectDto,
  ): Promise<TProject[]> {
    const memberProjectIds = this.db
      .select({
        projectId: projectMembers.projectId,
      })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));

    const conditions = [isNull(projects.deletedAt)];

    if (query.status) {
      conditions.push(eq(projects.status, query.status as TProjectStatus));
    }

    if (query.search) {
      conditions.push(ilike(projects.name, `%${query.search}%`));
    }

    if (query.deadlineFrom) {
      conditions.push(gte(projects.deadline, new Date(query.deadlineFrom)));
    }

    if (query.deadlineTo) {
      conditions.push(lte(projects.deadline, new Date(query.deadlineTo)));
    }

    const allProjects = await this.db
      .select()
      .from(projects)
      .where(
        and(
          or(
            eq(projects.createdBy, userId),
            inArray(projects.id, memberProjectIds),
          ),
          ...conditions,
        ),
      );
    return allProjects;
  }

  // Get a project by ID
  async getProjectById(projectId: string): Promise<TProject> {
    const [project] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)));

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  // Delete a project (soft delete)
  async deleteProject(projectId: string): Promise<void> {
    const [existingProject] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId)));

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    await this.db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(eq(projects.id, projectId));
  }

  // Create task for a specific project
  async createTask(
    projectId: string,
    userId: string,
    taskCreateDto: TaskCreateDto,
  ) {
    const [[existingProject], [existingUser]] = await Promise.all([
      this.db
        .select()
        .from(projects)
        .where(and(eq(projects.id, projectId), isNull(projects.deletedAt))),
      this.db
        .select()
        .from(users)
        .where(eq(users.id, taskCreateDto.assignedTo)),
    ]);

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    if (!existingUser) {
      throw new NotFoundException('Assigned user not found');
    }

    const payload: TNewTask = {
      title: taskCreateDto.title,
      description: taskCreateDto.description,
      projectId,
      assignedTo: taskCreateDto.assignedTo,
      createdBy: userId,
      priority: taskCreateDto.priority,
      status: taskCreateDto.status,
      dueDate: new Date(taskCreateDto.dueDate),
    };

    const [newTask] = await this.db.insert(tasks).values(payload).returning();

    return newTask;
  }
}
