import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { TPermissionCode } from 'src/common/constants/permissions';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import {
  permissions,
  projectMembers,
  rolePermissions,
} from 'src/database/schema';

@Injectable()
export class PermissionsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: TPgDatabase) {}

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
}
