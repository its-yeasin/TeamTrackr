import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { TTaskPriority } from 'src/common/constants';
import { priorityEnum } from 'src/database/schema';

export class TaskUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Title should not exceed 255 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsIn(priorityEnum.enumValues, {
    message: `Priority must be one of the following: ${priorityEnum.enumValues.join(', ')}`,
  })
  priority: TTaskPriority;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date' })
  dueDate: string;
}
