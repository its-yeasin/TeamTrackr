import { PartialType } from '@nestjs/mapped-types';
import { ProjectCreateDto } from './ProjectCreateDto';

export class ProjectUpdateDto extends PartialType(ProjectCreateDto) {}
