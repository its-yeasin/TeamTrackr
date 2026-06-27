import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import {
  projectMembers,
  projects,
  TNewProjectMember,
  TProjectMember,
  users,
} from 'src/database/schema';
import { ProjectsService } from 'src/projects/projects.service';
import { GetProjectMembersDto } from './dto/GetProjectMembersDto';

@Injectable()
export class ProjectMembersService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: TPgDatabase,
    private readonly projectsService: ProjectsService,
  ) {}

  //  Add a new project member
  async addProjectMember(
    projectId: string,
    memberUserId: string,
  ): Promise<TProjectMember> {
    const [[existingProject], [existingUser], [projectMember]] =
      await Promise.all([
        // Check if the project exists and is not deleted
        this.db
          .select()
          .from(projects)
          .where(and(eq(projects.id, projectId), isNull(projects.deletedAt))),

        // Check if the user exists
        this.db.select().from(users).where(eq(users.id, memberUserId)),

        // Check if the user is already a member of the project
        this.db
          .select()
          .from(projectMembers)
          .where(
            and(
              eq(projectMembers.projectId, projectId),
              eq(projectMembers.userId, memberUserId),
            ),
          ),
      ]);

    if (!existingProject) {
      throw new NotFoundException('Project not found or has been deleted');
    }

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (projectMember) {
      throw new ConflictException('User is already a member of this project');
    }

    const payload: TNewProjectMember = {
      projectId: existingProject.id,
      userId: existingUser.id,
      joinedAt: new Date(),
    };

    const [newProjectMember] = await this.db
      .insert(projectMembers)
      .values(payload)
      .returning();

    return newProjectMember;
  }

  //   Remove a project member
  async removeProjectMember(
    projectId: string,
    memberUserId: string,
  ): Promise<void> {
    const [member] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, memberUserId),
        ),
      );

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    await this.db
      .delete(projectMembers)
      .where(eq(projectMembers.id, member.id));
  }

  //  get project member by userId and projectId
  async getProjectMember(
    projectId: string,
    memberUserId: string,
  ): Promise<TProjectMember> {
    const [member] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, memberUserId),
        ),
      );

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    return member;
  }

  //   Get all members of a project
  async getProjectMembers(projectId: string): Promise<GetProjectMembersDto[]> {
    const project = await this.projectsService.getProjectById(projectId);

    const members = await this.db
      .select({
        userId: users.id,
        projectId: projectMembers.projectId,
        name: users.name,
        email: users.email,
        role: users.role,
        joinedAt: projectMembers.joinedAt,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, project.id));

    return members;
  }
}
