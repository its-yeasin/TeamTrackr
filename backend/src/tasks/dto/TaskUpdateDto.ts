import { PartialType } from '@nestjs/mapped-types';
import { TaskCreateDto } from './TaskCreateDto';

export class TaskUpdateDto extends PartialType(TaskCreateDto) {}
