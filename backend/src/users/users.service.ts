import { Inject, Injectable } from '@nestjs/common';
import { eq, ne } from 'drizzle-orm';
import { SYSTEM_ROLES } from 'src/common/constants';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import { users } from 'src/database/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: TPgDatabase) {}

  async getAllUsers() {
    const allUsers = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(ne(users.role, SYSTEM_ROLES.ADMIN));

    return allUsers;
  }

  async getCurrentUser(userId: string) {
    const user = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user[0];
  }
}
