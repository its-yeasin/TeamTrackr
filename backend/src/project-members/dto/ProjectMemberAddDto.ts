import { IsNotEmpty, IsUUID } from 'class-validator';

export class ProjectMemberAddDto {
  @IsNotEmpty({ message: 'User is required' })
  @IsUUID()
  userId: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsUUID()
  roleId: string;
}
