import type { TPgDatabase } from 'src/common/interfaces/db';
import { permissions, projectRoles, rolePermissions } from '../schema';
import {
  PERMISSION_CODES,
  type TPermissionCode,
} from 'src/common/constants/permissions';

const rolePermissionsData: Record<string, TPermissionCode[]> = {
  'Project Admin': [
    PERMISSION_CODES.PROJECT_VIEW,
    PERMISSION_CODES.PROJECT_UPDATE,
    PERMISSION_CODES.PROJECT_DELETE,

    PERMISSION_CODES.PROJECT_MEMBER_ADD,
    PERMISSION_CODES.PROJECT_MEMBER_UPDATE,
    PERMISSION_CODES.PROJECT_MEMBER_REMOVE,

    PERMISSION_CODES.PROJECT_ROLE_MANAGE,

    PERMISSION_CODES.TASK_CREATE,
    PERMISSION_CODES.TASK_VIEW,
    PERMISSION_CODES.TASK_UPDATE,
    PERMISSION_CODES.TASK_DELETE,
    PERMISSION_CODES.TASK_ASSIGN,
    PERMISSION_CODES.TASK_STATUS_UPDATE,
    PERMISSION_CODES.TASK_COMMENT,

    PERMISSION_CODES.ACTIVITY_VIEW,
    PERMISSION_CODES.REPORT_VIEW,
  ],
  'Project Manager': [
    PERMISSION_CODES.PROJECT_VIEW,
    PERMISSION_CODES.PROJECT_UPDATE,

    PERMISSION_CODES.PROJECT_MEMBER_ADD,
    PERMISSION_CODES.PROJECT_MEMBER_UPDATE,

    PERMISSION_CODES.PROJECT_ROLE_MANAGE,

    PERMISSION_CODES.TASK_CREATE,
    PERMISSION_CODES.TASK_VIEW,
    PERMISSION_CODES.TASK_UPDATE,
    PERMISSION_CODES.TASK_DELETE,
    PERMISSION_CODES.TASK_ASSIGN,
    PERMISSION_CODES.TASK_STATUS_UPDATE,
    PERMISSION_CODES.TASK_COMMENT,

    PERMISSION_CODES.ACTIVITY_VIEW,
    PERMISSION_CODES.REPORT_VIEW,
  ],
  Developer: [
    PERMISSION_CODES.PROJECT_VIEW,

    PERMISSION_CODES.TASK_VIEW,
    PERMISSION_CODES.TASK_CREATE,
    PERMISSION_CODES.TASK_UPDATE,
    PERMISSION_CODES.TASK_COMMENT,

    PERMISSION_CODES.ACTIVITY_VIEW,
  ],
  Tester: [
    PERMISSION_CODES.PROJECT_VIEW,

    PERMISSION_CODES.TASK_VIEW,
    PERMISSION_CODES.TASK_COMMENT,

    PERMISSION_CODES.ACTIVITY_VIEW,
  ],
  Viewer: [
    PERMISSION_CODES.PROJECT_VIEW,
    PERMISSION_CODES.TASK_VIEW,

    PERMISSION_CODES.ACTIVITY_VIEW,
    PERMISSION_CODES.REPORT_VIEW,
  ],
};

async function seedRolePermissions(db: TPgDatabase) {
  console.info('Seeding role permissions...');

  try {
    // Fetch all roles and permissions from the database
    const allRoles = await db.select().from(projectRoles);
    const allPermissions = await db.select().from(permissions);

    const roleMap = new Map(allRoles.map((r) => [r.name, r.id]));
    const permissionMap = new Map(allPermissions.map((p) => [p.code, p.id]));

    for (const item of Object.entries(rolePermissionsData)) {
      const [roleName, permissions] = item;
      const roleId = roleMap.get(roleName);

      if (!roleId) {
        console.warn(`Role "${roleName}" not found in the database.`);
        continue;
      }

      for (const permission of permissions) {
        const permissionId = permissionMap.get(permission);

        if (!permissionId) {
          console.warn(`Permission "${permission}" not found in the database.`);
          continue;
        }

        await db
          .insert(rolePermissions)
          .values({
            roleId,
            permissionId,
            status: 'ACTIVE',
          })
          .onConflictDoNothing();
      }
    }
  } catch (error) {
    console.error('Error seeding role permissions:', error);
    throw error; // Rethrow the error to ensure the process exits with a failure code
  }
}

export default seedRolePermissions;
