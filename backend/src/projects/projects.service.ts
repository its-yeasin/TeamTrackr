import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import { ProjectCreateDto } from './dto/ProjectCreateDto';
import {
  projectMembers,
  projects,
  TNewProject,
  TProject,
  users,
} from 'src/database/schema';
import { and, eq, inArray, isNull, or } from 'drizzle-orm';

@Injectable()
export class ProjectsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: TPgDatabase) {}

  async createProject(
    dto: ProjectCreateDto,
    userId: string,
  ): Promise<TProject> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

  // Get all projects
  async getAllProjects(userId: string): Promise<TProject[]> {
    const memberProjectIds = this.db
      .select({
        projectId: projectMembers.projectId,
      })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));

    const allProjects = await this.db
      .select()
      .from(projects)
      .where(
        and(
          isNull(projects.deletedAt),
          or(
            eq(projects.createdBy, userId),
            inArray(projects.id, memberProjectIds),
          ),
        ),
      );
    return allProjects;
  }
}
