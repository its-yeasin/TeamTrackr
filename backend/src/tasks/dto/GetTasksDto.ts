import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { priorityEnum, taskStatusEnum } from 'src/database/schema';

export class GetTasksDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsIn(priorityEnum.enumValues, {
    message: `Priority must be one of the following values: ${priorityEnum.enumValues.join(', ')}`,
  })
  priority?: string;

  @IsOptional()
  @IsIn(taskStatusEnum.enumValues, {
    message: `Status must be one of the following values: ${taskStatusEnum.enumValues.join(', ')}`,
  })
  status?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid' })
  dueDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Created at must be a valid date string' })
  createdAt?: string;
}
