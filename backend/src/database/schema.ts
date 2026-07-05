import { timestamp } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import {
  varchar,
  unique,
  pgEnum,
  uuid,
  text,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import {
  PROJECT_STATUSES,
  SYSTEM_ROLES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from 'src/common/constants';
import { PERMISSIONS } from 'src/common/constants/permissions';

export const systemRoleEnum = pgEnum('system_role', [
  SYSTEM_ROLES.ADMIN,
  SYSTEM_ROLES.USER,
]);

export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE']);

export const projectStatusEnum = pgEnum('project_status', [
  PROJECT_STATUSES.ACTIVE,
  PROJECT_STATUSES.COMPLETED,
  PROJECT_STATUSES.ON_HOLD,
]);

export const priorityEnum = pgEnum('task_priority', [
  TASK_PRIORITIES.HIGH,
  TASK_PRIORITIES.MEDIUM,
  TASK_PRIORITIES.LOW,
]);

export const taskStatusEnum = pgEnum('task_status', [
  TASK_STATUSES.TODO,
  TASK_STATUSES.IN_PROGRESS,
  TASK_STATUSES.COMPLETED,
]);

export const permissionScopeEnum = pgEnum('permission_scope', [
  'SYSTEM',
  'PROJECT',
]);

export const permissionEnum = pgEnum('permission', PERMISSIONS);

export const entityTypeEnum = pgEnum('entity_type', ['PROJECT', 'TASK']);

export const activityActionEnum = pgEnum('action', [
  'PROJECT_CREATED',
  'PROJECT_UPDATED',
  'TASK_CREATED',
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'MEMBER_ADDED',
]);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: systemRoleEnum('role').default('USER').notNull(),
  status: userStatusEnum('status').default('ACTIVE').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_At').defaultNow().notNull(),
  updatedAt: timestamp('updated_At').defaultNow().notNull(),
});

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    token: text('token').notNull(),
    isUsed: boolean('is_used').default(false).notNull(),
    isRevoked: boolean('is_revoked').default(false).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_At').defaultNow().notNull(),
  },

  (table) => [
    index('rt_user_id_idx').on(table.userId),
    index('rt_token_idx').on(table.token),
  ],
);

// Projects table
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    status: projectStatusEnum('status').default('ACTIVE').notNull(),
    deadline: timestamp('deadline').notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_At').defaultNow().notNull(),
    updatedAt: timestamp('updated_At').defaultNow().notNull(),
    deletedAt: timestamp('deleted_At'),
  },
  (table) => [
    index('project_created_by_idx').on(table.createdBy),
    index('project_deleted_at_idx').on(table.deletedAt),
  ],
);

// Roles table
export const projectRoles = pgTable('project_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_At').defaultNow().notNull(),
  updatedAt: timestamp('updated_At').defaultNow().notNull(),
});

// Permissions table
export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: permissionEnum('code').notNull(),
  description: text('description').notNull(),
  scope: pgEnum('permission_scope', ['SYSTEM', 'PROJECT'])('scope')
    .default('PROJECT')
    .notNull(),
  createdAt: timestamp('created_At').defaultNow().notNull(),
  updatedAt: timestamp('updated_At').defaultNow().notNull(),
});

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .references(() => projectRoles.id)
      .notNull(),
    permissionId: uuid('permission_id')
      .references(() => permissions.id)
      .notNull(),
    createdAt: timestamp('created_At').defaultNow().notNull(),
  },
  (table) => [
    unique('role_permission_unique').on(table.roleId, table.permissionId),
  ],
);

// Project members table
export const projectMembers = pgTable(
  'project_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    roleId: uuid('role_id')
      .references(() => projectRoles.id)
      .notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [
    unique('project_user_unique').on(table.projectId, table.userId),
    index('pm_user_id_idx').on(table.userId),
  ],
);

// Tasks table
export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id)
      .notNull(),
    assignedTo: uuid('assigned_to').references(() => users.id),
    createdBy: uuid('created_by')
      .references(() => users.id)
      .notNull(),
    priority: priorityEnum('priority').notNull(),
    status: taskStatusEnum('status').default('TODO').notNull(),
    dueDate: timestamp('due_date').notNull(),
    createdAt: timestamp('created_At').defaultNow().notNull(),
    updatedAt: timestamp('updated_At').defaultNow().notNull(),
    deletedAt: timestamp('deleted_At'),
  },
  (table) => [
    index('task_project_id_idx').on(table.projectId),
    index('task_assigned_to_idx').on(table.assignedTo),
  ],
);

// Activity logs table
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  action: activityActionEnum('action').notNull(),
  entityType: entityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  createdAt: timestamp('created_At').defaultNow().notNull(),
});

// Export types of each schema
export type TUser = typeof users.$inferSelect;

export type TNewUser = typeof users.$inferInsert;

export type TProject = typeof projects.$inferSelect;

export type TNewProject = typeof projects.$inferInsert;

export type TProjectMember = typeof projectMembers.$inferSelect;

export type TNewProjectMember = typeof projectMembers.$inferInsert;

export type TTask = typeof tasks.$inferSelect;

export type TNewTask = typeof tasks.$inferInsert;

export type TActivityLog = typeof activityLogs.$inferSelect;

export type TSystemRole = typeof systemRoleEnum;
