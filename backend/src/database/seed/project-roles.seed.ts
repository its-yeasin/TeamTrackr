// import type { TPgDatabase } from 'src/common/interfaces/db';
// import { roles } from '../schema';
// import { inArray } from 'drizzle-orm';

// const roles = [
//   {
//     name: 'Project Admin',
//     description: 'Full control over the project',
//   },
//   {
//     name: 'Project Manager',
//     description: 'Manage project and team',
//   },
//   {
//     name: 'Developer',
//     description: 'Develop project tasks',
//   },
//   {
//     name: 'Tester',
//     description: 'Test assigned tasks',
//   },
//   {
//     name: 'Viewer',
//     description: 'Read-only access',
//   },
// ];

// async function seedProjectRoles(db: TPgDatabase) {
//   console.info('Seeding project roles...');

//   try {
//     const existingRoles = await db
//       .select()
//       .from(roles)
//       .where(
//         inArray(
//           roles.name,
//           roles.map((role) => role.name),
//         ),
//       );

//     const roleNames = new Set(existingRoles.map((role) => role.name)); // ex: Set { 'Project Admin', 'Developer' }

//     const rolesToInsert = roles.filter((role) => !roleNames.has(role.name));

//     if (rolesToInsert.length > 0) {
//       await db.insert(roles).values(rolesToInsert);
//       console.info(`Inserted ${rolesToInsert.length} new project roles.`);
//     } else {
//       console.info('No new project roles to insert.');
//       return;
//     }
//   } catch (error) {
//     console.error('Error seeding project roles:', error);
//     throw error; // Rethrow the error to ensure the process exits with a failure code
//   }
// }

// export default seedProjectRoles;
