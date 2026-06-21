import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { TTaskPriority } from 'src/common/constants';
import { priorityEnum } from 'src/database/schema';

export class TaskCreateDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title should not exceed 255 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsNotEmpty({ message: 'Priority is required' })
  @IsIn(priorityEnum.enumValues, {
    message: `Priority must be one of the following: ${priorityEnum.enumValues.join(', ')}`,
  })
  priority: TTaskPriority;

  @IsDateString({}, { message: 'Due date must be a valid date' })
  @IsNotEmpty({ message: 'Due date is required' })
  dueDate: string;
}
