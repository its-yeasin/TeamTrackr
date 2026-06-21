import { IsNotEmpty, IsUUID } from 'class-validator';

export class ProjectMemberCreateDto {
  @IsNotEmpty({ message: 'Project is required' })
  @IsUUID()
  projectId: string;

  @IsNotEmpty({ message: 'User is required' })
  @IsUUID()
  userId: string;
}
