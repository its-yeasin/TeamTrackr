import postgres from 'postgres';
import { seedAdmin } from './admin.seed';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';
import seedPermissions from './permission.seed';

const client = postgres(process.env.DATABASE_URL);

const db = drizzle(client, {
  schema: schema,
});

async function bootstrap() {
  await seedAdmin(db);

  await seedPermissions(db);

  process.exit(0);
}

bootstrap();
