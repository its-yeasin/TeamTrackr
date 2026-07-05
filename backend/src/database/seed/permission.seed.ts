import { PERMISSION_CODES } from 'src/common/constants/permissions';
import { TPgDatabase } from 'src/common/interfaces/db';
import { permissions } from '../schema';

const permissionData = [
  {
    code: PERMISSION_CODES.PROJECT_CREATE,
    description: 'Create a new project',
  },
  {
    code: PERMISSION_CODES.PROJECT_VIEW,
    description: 'View project details and associated tasks',
  },
  {
    code: PERMISSION_CODES.PROJECT_UPDATE,
    description: 'Update project details (name, description, status)',
  },
  { code: PERMISSION_CODES.PROJECT_DELETE, description: 'Delete a project' },
  { code: PERMISSION_CODES.PROJECT_ARCHIVE, description: 'Archive a project' },
  {
    code: PERMISSION_CODES.PROJECT_RESTORE,
    description: 'Restore an archived project',
  },
  {
    code: PERMISSION_CODES.PROJECT_MEMBER_INVITE,
    description: 'Invite a user to join the project',
  },
  {
    code: PERMISSION_CODES.PROJECT_MEMBER_ADD,
    description: 'Add a user to the project as a member',
  },
  {
    code: PERMISSION_CODES.PROJECT_MEMBER_UPDATE,
    description: "Update a project member's role or permissions",
  },
  {
    code: PERMISSION_CODES.PROJECT_MEMBER_REMOVE,
    description: 'Remove a member from the project',
  },
  {
    code: PERMISSION_CODES.PROJECT_ROLE_MANAGE,
    description: 'Manage roles within the project',
  },
  {
    code: PERMISSION_CODES.PROJECT_PERMISSION_MANAGE,
    description: 'Manage permissions for roles within the project',
  },
  { code: PERMISSION_CODES.TASK_CREATE, description: 'Create a new task' },
  { code: PERMISSION_CODES.TASK_VIEW, description: 'View task details' },
  { code: PERMISSION_CODES.TASK_UPDATE, description: 'Update task details' },
  { code: PERMISSION_CODES.TASK_DELETE, description: 'Delete a task' },
  {
    code: PERMISSION_CODES.TASK_ASSIGN,
    description: 'Assign a task to a user',
  },
  {
    code: PERMISSION_CODES.TASK_STATUS_UPDATE,
    description:
      'Update the status of a task (e.g., To Do, In Progress, Completed)',
  },
  {
    code: PERMISSION_CODES.TASK_PRIORITY_UPDATE,
    description: 'Update the priority of a task (e.g., High, Medium, Low)',
  },
  { code: PERMISSION_CODES.TASK_COMMENT, description: 'Comment on a task' },

  {
    code: PERMISSION_CODES.ACTIVITY_VIEW,
    description: 'View activity logs',
  },
  {
    code: PERMISSION_CODES.REPORT_VIEW,
    description: 'View reports',
  },
  //   {
  //     code: PERMISSION_CODES.TASK_DUE_DATE_UPDATE,
  //     description: 'Update the due date of a task',
  //   },
  //   {
  //     code: PERMISSION_CODES.TASK_ATTACHMENT_UPLOAD,
  //     description: 'Upload an attachment to a task',
  //   },
  //   {
  //     code: PERMISSION_CODES.TASK_ATTACHMENT_DELETE,
  //     description: 'Delete an attachment from a task',
  //   },
];

async function seedPermissions(db: TPgDatabase) {
  console.info('Seeding permissions...');

  try {
    const existingPermissions = await db.select().from(permissions);

    if (existingPermissions.length > 0) {
      console.info('Permissions already seeded. Skipping.');
      return;
    }

    await db.insert(permissions).values(permissionData);

    console.info('Permissions seeded successfully.');
  } catch (error) {
    console.error('Error seeding permissions:', error);
    throw error; // Rethrow the error to ensure the process exits with a failure code
  }
}

export default seedPermissions;
