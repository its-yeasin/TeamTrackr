import { varchar, unique } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { pgEnum, uuid, text, boolean } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('user_role', [
  'ADMIN',
  'PROJECT_MANAGER',
  'TEAM_MEMBER',
]);
export const projectStatusEnum = pgEnum('project_status', [
  'ACTIVE',
  'COMPLETED',
  'ON_HOLD',
]);
export const priorityEnum = pgEnum('task_priority', ['HIGH', 'MEDIUM', 'LOW']);
export const taskStatusEnum = pgEnum('task_status', [
  'TODO',
  'IN_PROGRESS',
  'COMPLETED',
]);
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
  role: roleEnum('role').default('TEAM_MEMBER').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_At').defaultNow().notNull(),
  updatedAt: timestamp('updated_At').defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  token: text('token').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_At').defaultNow().notNull(),
});

// Projects table
export const projects = pgTable('projects', {
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
});

// Project memebers table
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
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    projectUserUnique: unique().on(table.projectId, table.userId),
  }),
);

// Tasks table
export const tasks = pgTable('tasks', {
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
});

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

export type TTask = typeof tasks.$inferSelect;

export type TActivityLog = typeof activityLogs.$inferSelect;

export type TRole = typeof roleEnum;

export type TProjectStatus = typeof projectStatusEnum;
