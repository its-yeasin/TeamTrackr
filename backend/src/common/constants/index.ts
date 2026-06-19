
/* ==================User Roles================== */
export const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TEAM_MEMBER: 'TEAM_MEMBER',
} as const;


/* ==================Project Status================== */
export const PROJECT_STATUSES = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
} as const;

export type TProjectStatus =
  (typeof PROJECT_STATUSES)[keyof typeof PROJECT_STATUSES];


/* ==================Task Priority================== */
export const TASK_PRIORITIES = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW"
} as const

export type TTaskPriority = (typeof TASK_PRIORITIES)[keyof typeof TASK_PRIORITIES]

/* ==================Task Status================== */
export const TASK_STATUSES = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED"
} as const

export type TTaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES]