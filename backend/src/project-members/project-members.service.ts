import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import {
  permissions,
  projectMembers,
  rolePermissions,
  roles,
  TNewProjectMember,
  TProjectMember,
  users,
} from 'src/database/schema';
import { ProjectsService } from 'src/projects/projects.service';
import { GetProjectMembersDto } from './dto/GetProjectMembersDto';
import { ProjectMemberAddDto } from './dto/ProjectMemberAddDto';

@Injectable()
export class ProjectMembersService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: TPgDatabase,
    private readonly projectsService: ProjectsService,
  ) {}

  //  Add a new project member
  async addProjectMember(
    projectId: string,
    memberAddDto: ProjectMemberAddDto,
    db = this.db,
  ): Promise<TProjectMember> {
    const [, [existingUser], [projectMember]] = await Promise.all([
      // Check if the project exists and is not deleted
      this.projectsService.getProjectById(projectId),

      // Check if the user already exists
      db.select().from(users).where(eq(users.id, memberAddDto.userId)),

      // Check if the user is already a member of the project
      db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, memberAddDto.userId),
          ),
        ),
    ]);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (projectMember) {
      throw new ConflictException('User is already a member of this project');
    }

    const payload: TNewProjectMember = {
      projectId: projectId,
      userId: memberAddDto.userId,
      roleId: memberAddDto.roleId,
    };

    const [newProjectMember] = await db
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

    const rows = await this.db
      .select({
        userId: users.id,
        projectId: projectMembers.projectId,
        name: users.name,
        email: users.email,
        role: roles.name,
        permissionCode: permissions.code,
        joinedAt: projectMembers.joinedAt,
        enabled: rolePermissions.enabled,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .innerJoin(roles, eq(projectMembers.roleId, roles.id))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(projectMembers.projectId, project.id),
          eq(rolePermissions.enabled, true),
        ),
      );

    const rowGroup = new Map<string, GetProjectMembersDto>();
    for (const row of rows) {
      if (!rowGroup.has(row.userId)) {
        rowGroup.set(row.userId, {
          userId: row.userId,
          projectId: row.projectId,
          name: row.name,
          email: row.email,
          role: row.role,
          joinedAt: row.joinedAt,
          permissions: [],
        });
      }

      rowGroup.get(row.userId)?.permissions.push(row.permissionCode);
    }

    return Array.from(rowGroup.values());
  }
}
