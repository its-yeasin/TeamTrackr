export const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TEAM_MEMBER: 'TEAM_MEMBER',
} as const;

export type TRoleConstant = (typeof ROLES)[keyof typeof ROLES];
