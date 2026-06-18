import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { projectStatusEnum } from 'src/database/schema';

export class GetProjectDto {
  @IsOptional()
  @IsEnum(projectStatusEnum.enumValues, {
    message: 'Status must be ACTIVE, COMPLETED, or ON_HOLD',
  })
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  deadlineFrom?: string;

  @IsOptional()
  @IsDateString()
  deadlineTo?: string;
}
