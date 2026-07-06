import { Inject, Injectable } from '@nestjs/common';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import { AvailableRolesDto } from './dto/AvailableRolesDto';
import { projectRoles } from 'src/database/schema';

@Injectable()
export class RolesService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: TPgDatabase) {}

  // Get all available project roles
  async getProjectRoles(): Promise<AvailableRolesDto[]> {
    const roles = await this.db
      .select({
        id: projectRoles.id,
        name: projectRoles.name,
        description: projectRoles.description,
      })
      .from(projectRoles);

    return roles;
  }
}
