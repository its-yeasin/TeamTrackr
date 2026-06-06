import { defineConfig } from 'drizzle-kit';
import * as dotEnv from 'dotenv';

dotEnv.config();

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
