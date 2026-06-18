import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ProjectCreateDto {
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  @MaxLength(255, { message: 'Name should not exceed 255 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'COMPLETED', 'ON_HOLD'], {
    message: 'Status must be ACTIVE, COMPLETED, or ON_HOLD',
  })
  status?: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

  @IsDateString({}, { message: 'Deadline must be a valid date' })
  @IsNotEmpty({ message: 'Deadline is required' })
  deadline: string;
}
