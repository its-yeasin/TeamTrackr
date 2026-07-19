import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { TPermissionCode } from 'src/common/constants/permissions';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import {
  permissions,
  projectMembers,
  roles,
  rolePermissions,
} from 'src/database/schema';
import { RolePermissionResponseDto } from './dto/RolePermissionResponseDto';

@Injectable()
export class PermissionsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: TPgDatabase) {}

  // Check if a user has specific permissions within a project
  async hasPermission(
    userId: string,
    projectId: string,
    permissionCodes: TPermissionCode[],
  ): Promise<boolean> {
    const [permission] = await this.db
      .select()
      .from(projectMembers)
      .innerJoin(
        rolePermissions,
        eq(projectMembers.roleId, rolePermissions.roleId),
      )
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(projectMembers.userId, userId),
          eq(projectMembers.projectId, projectId),
          inArray(permissions.code, permissionCodes),
        ),
      )
      .limit(1);

    return !!permission;
  }

  // All available permissions in the system
  async getAllPermissions(): Promise<
    { code: TPermissionCode; description: string }[]
  > {
    return this.db.select().from(permissions);
  }

  // Get all permissions associated with a specific role
  async getRolePermissions(): Promise<RolePermissionResponseDto[]> {
    const rolePermissionsList = await this.db
      .select({
        roleId: rolePermissions.roleId,
        roleName: roles.name,
        roleDescription: roles.description,
        permissionId: rolePermissions.permissionId,
        permissionCode: permissions.code,
        permissionDescription: permissions.description,
        enabled: rolePermissions.enabled,
      })
      .from(roles)
      .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id));

    const result: RolePermissionResponseDto[] = [];
    const map = new Map<string, RolePermissionResponseDto>();

    for (const rp of rolePermissionsList) {
      if (!map.has(rp.roleId)) {
        const roleDto: RolePermissionResponseDto = {
          id: rp.roleId,
          name: rp.roleName,
          description: rp.roleDescription,
          permissions: [],
        };
        map.set(rp.roleId, roleDto);
        result.push(roleDto);
      }

      const roleDto = map.get(rp.roleId);
      if (roleDto) {
        roleDto.permissions.push({
          id: rp.permissionId,
          code: rp.permissionCode,
          description: rp.permissionDescription,
          enabled: rp.enabled,
        });
      }
    }

    return result;
  }
}
