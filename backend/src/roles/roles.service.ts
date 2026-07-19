import { Inject, Injectable } from '@nestjs/common';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import { AvailableRolesDto } from './dto/AvailableRolesDto';
import { roles } from 'src/database/schema';

@Injectable()
export class RolesService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: TPgDatabase) {}

  // Get all available project roles
  async getProjectRoles(): Promise<AvailableRolesDto[]> {
    const allRoles = await this.db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
      })
      .from(roles);

    return allRoles;
  }
}
