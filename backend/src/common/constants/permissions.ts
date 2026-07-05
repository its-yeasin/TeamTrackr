export const PERMISSIONS = [
  'project.view',
  'project.create',
  'project.update',
  'project.delete',

  'project.archive',
  'project.restore',

  'project.member.invite',
  'project.member.add',
  'project.member.update',
  'project.member.remove',

  'project.role.manage',
  'project.permission.manage',

  'task.create',
  'task.view',
  'task.update',
  'task.delete',

  'task.assign',

  'task.status.update',
  'task.priority.update',
  'task.due_date.update',

  'task.comment',
  'task.attachment.upload',
  'task.attachment.delete',
  'activity.view',
  'report.view',
] as const;

export const PERMISSION_CODES = {
  PROJECT_VIEW: 'project.view',
  PROJECT_CREATE: 'project.create',
  PROJECT_UPDATE: 'project.update',
  PROJECT_DELETE: 'project.delete',

  PROJECT_ARCHIVE: 'project.archive',
  PROJECT_RESTORE: 'project.restore',

  PROJECT_MEMBER_INVITE: 'project.member.invite',
  PROJECT_MEMBER_ADD: 'project.member.add',
  PROJECT_MEMBER_UPDATE: 'project.member.update',
  PROJECT_MEMBER_REMOVE: 'project.member.remove',

  PROJECT_ROLE_MANAGE: 'project.role.manage',
  PROJECT_PERMISSION_MANAGE: 'project.permission.manage',

  TASK_CREATE: 'task.create',
  TASK_VIEW: 'task.view',
  TASK_UPDATE: 'task.update',
  TASK_DELETE: 'task.delete',
  TASK_ASSIGN: 'task.assign',
  TASK_STATUS_UPDATE: 'task.status.update',
  TASK_PRIORITY_UPDATE: 'task.priority.update',
  TASK_DUE_DATE_UPDATE: 'task.due_date.update',

  TASK_COMMENT: 'task.comment',
  TASK_ATTACHMENT_UPLOAD: 'task.attachment.upload',
  TASK_ATTACHMENT_DELETE: 'task.attachment.delete',

  ACTIVITY_VIEW: 'activity.view',

  REPORT_VIEW: 'report.view',
} as const;

export type TPermissionCode = (typeof PERMISSIONS)[number];
