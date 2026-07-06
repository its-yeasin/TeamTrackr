export class RolePermissionResponseDto {
  id: string;
  name: string;
  description: string;
  permissions: {
    id: string;
    code: string;
    description: string;
  }[];
}
