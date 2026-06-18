import type { TPgDatabase } from 'src/common/interfaces/db';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import { ROLES } from 'src/common/constants';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export async function seedAdmin(db: TPgDatabase) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      'Admin email or password not set in environment variables. Skipping admin seeding.',
    );
    return;
  }

  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail));

  if (admin) return;

  await db.insert(users).values({
    name: 'System Admin',
    email: adminEmail,
    passwordHash: await bcrypt.hash(adminPassword, 10),
    role: ROLES.ADMIN,
  });

  console.log('Admin created with email:', adminEmail);
}
