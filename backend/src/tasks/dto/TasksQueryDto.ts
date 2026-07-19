import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { taskPriorityEnum, taskStatusEnum } from 'src/database/schema';

export class TasksQueryDto {
  @IsOptional()
  @IsString({ message: 'Search value must be a string' })
  search?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsIn(taskPriorityEnum.enumValues, {
    message: `Priority must be one of the following values: ${taskPriorityEnum.enumValues.join(', ')}`,
  })
  priority?: string;

  @IsOptional()
  @IsIn(taskStatusEnum.enumValues, {
    message: `Status must be one of the following values: ${taskStatusEnum.enumValues.join(', ')}`,
  })
  status?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid' })
  dueFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid' })
  dueTo?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Created at must be a valid date string' })
  createdFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Created at must be a valid date string' })
  createdTo?: string;

  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  page?: number;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  limit?: number;
}
