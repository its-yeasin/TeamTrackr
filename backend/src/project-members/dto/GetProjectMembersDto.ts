export class GetProjectMembersDto {
  userId: string;
  projectId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
  permissions: string[];
}
