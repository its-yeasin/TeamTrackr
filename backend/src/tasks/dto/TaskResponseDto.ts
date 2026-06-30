import { TTask } from 'src/database/schema';

export class TaskResponseDto {
  data: Partial<TTask>[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
