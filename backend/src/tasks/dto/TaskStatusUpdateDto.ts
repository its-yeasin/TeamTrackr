import { IsIn } from 'class-validator';
import type { TTaskStatus } from 'src/common/constants';
import { taskStatusEnum } from 'src/database/schema';

export class TaskStatusUpdateDto {
  @IsIn(taskStatusEnum.enumValues, {
    message: `Status must be one of: ${taskStatusEnum.enumValues.join(', ')}`,
  })
  status: TTaskStatus;
}
