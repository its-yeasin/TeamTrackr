import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import { ProjectCreateDto } from './dto/ProjectCreateDto';
import {
  permissions,
  projectMembers,
  projects,
  rolePermissions,
  roles,
  TNewProject,
  TProject,
  type TRolePermissionPayload,
} from 'src/database/schema';
import { and, eq, gte, ilike, inArray, isNull, lte, or } from 'drizzle-orm';
import { GetProjectDto } from './dto/GetProjectDto';
import { TProjectStatus } from 'src/common/constants';
import { ProjectUpdateDto } from './dto/ProjectUpdateDto';
import {
  DEFAULT_PROJECT_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
} from './projects.constants';

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

    const newProject = await this.db.transaction(async (tx) => {
      // Insert the new project
      const [newProject] = await tx
        .insert(projects)
        .values(payload)
        .returning();

      // Create default roles for the new project
      const { ownerRole } = await this.initializeProjectRoles(
        newProject.id,
        tx,
      );

      // Add the creator as the Owner of the project
      await tx.insert(projectMembers).values({
        projectId: newProject.id,
        userId,
        roleId: ownerRole?.id,
      });

      return newProject;
    });

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

  // createRoles
  private async initializeProjectRoles(projectId: string, tx = this.db) {
    const roleData = DEFAULT_PROJECT_ROLES.map((role) => ({
      projectId,
      isDefault: true,
      ...role,
    }));

    const insertedRoles = await tx.insert(roles).values(roleData).returning();

    // Get all permissions
    const allPermissions = await tx.select().from(permissions);

    const rolePermissionRows: TRolePermissionPayload[] = [];

    for (const role of insertedRoles) {
      // Get the allowed permissions for this role from the DEFAULT_ROLE_PERMISSIONS mapping
      const allowedPermissions = DEFAULT_ROLE_PERMISSIONS[role.code] ?? [];

      for (const permission of allPermissions) {
        // Check if the permission is allowed for this role
        rolePermissionRows.push({
          roleId: role.id,
          permissionId: permission.id,
          enabled: allowedPermissions.includes(permission.code),
        });
      }
    }

    // Insert role-permission mappings into the rolePermissions table
    await tx.insert(rolePermissions).values(rolePermissionRows);

    return {
      roles: insertedRoles,
      ownerRole: insertedRoles.find((role) => role.code === 'OWNER'),
    };
  }
}
