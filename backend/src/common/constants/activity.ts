/* ==================Activity Entity Types================== */
export const ACTIVITY_ENTITY_TYPES = {
  PROJECT: 'PROJECT',
  TASK: 'TASK',
} as const;

export type TActivityEntityType =
  (typeof ACTIVITY_ENTITY_TYPES)[keyof typeof ACTIVITY_ENTITY_TYPES];

/* ==================Activity Actions================== */
export const ACTIVITY_ACTIONS = {
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  TASK_CREATED: 'TASK_CREATED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  MEMBER_ADDED: 'MEMBER_ADDED',
} as const;

export type TActivityAction =
  (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];
