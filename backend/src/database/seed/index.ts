import postgres from 'postgres';
import { seedAdmin } from './admin.seed';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';
import seedProjectRoles from './project-roles.seed';
import seedPermissions from './permission.seed';
import seedRolePermissions from './role-permissions.seed';

const client = postgres(process.env.DATABASE_URL);

const db = drizzle(client, {
  schema: schema,
});

async function bootstrap() {
  await seedAdmin(db);

  await seedProjectRoles(db);

  await seedPermissions(db);

  await seedRolePermissions(db);

  process.exit(0);
}

bootstrap();
