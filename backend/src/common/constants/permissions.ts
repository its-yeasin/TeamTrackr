export const PERMISSION_CODES = {
  PROJECT_VIEW: 'project.view',
  PROJECT_UPDATE: 'project.update',
  PROJECT_DELETE: 'project.delete',

  PROJECT_ARCHIVE: 'project.archive',
  PROJECT_RESTORE: 'project.restore',

  PROJECT_MEMBER_ADD: 'project.member.add',
  PROJECT_MEMBER_UPDATE: 'project.member.update',
  PROJECT_MEMBER_REMOVE: 'project.member.remove',

  PROJECT_ROLE_MANAGE: 'project.role.manage',

  TASK_CREATE: 'task.create',
  TASK_VIEW: 'task.view',
  TASK_UPDATE: 'task.update',
  TASK_DELETE: 'task.delete',
  TASK_ASSIGN: 'task.assign',
  TASK_STATUS_UPDATE: 'task.status.update',
  TASK_PRIORITY_UPDATE: 'task.priority.update',
  TASK_DUE_DATE_UPDATE: 'task.due_date.update',

  TASK_COMMENT: 'task.comment',

  ACTIVITY_VIEW: 'activity.view',

  REPORT_VIEW: 'report.view',
} as const;

export type TPermissionCode =
  (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];
