import {
  and,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  SQL,
} from 'drizzle-orm';
import {
  ROLES,
  type TTaskPriority,
  type TTaskStatus,
  type TUserRole,
} from 'src/common/constants';
import { TasksQueryDto } from './dto/TasksQueryDto';
import { projectMembers, tasks } from 'src/database/schema';
import { TPgDatabase } from 'src/common/interfaces/db';

export class TaskQueryBuilder {
  constructor(
    private readonly user: { id: string; role: TUserRole },
    private readonly query: TasksQueryDto,
    private readonly db: TPgDatabase,
  ) {}

  // conditions array to hold the query conditions
  private conditions: SQL[] = [isNull(tasks.deletedAt)];

  // Check the visibility of tasks based on the user's role
  private visibilityFilter(): void {
    if (this.user.role === ROLES.ADMIN) {
      return;
    }

    const memberProjectIds = this.db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, this.user.id));

    // tasks based on the projects the user is a member of
    this.conditions.push(inArray(tasks.projectId, memberProjectIds));
  }

  // Build the query conditions based on the provided query parameters
  private queryFilter(): void {
    if (this.query.search) {
      this.conditions.push(
        or(
          ilike(tasks.title, `%${this.query.search}%`),
          ilike(tasks.description, `%${this.query.search}%`),
        ),
      );
    }

    if (this.query.assignedTo) {
      this.conditions.push(eq(tasks.assignedTo, this.query.assignedTo));
    }

    if (this.query.projectId) {
      this.conditions.push(eq(tasks.projectId, this.query.projectId));
    }

    if (this.query.priority) {
      this.conditions.push(
        eq(tasks.priority, this.query.priority as TTaskPriority),
      );
    }

    if (this.query.status) {
      this.conditions.push(eq(tasks.status, this.query.status as TTaskStatus));
    }

    if (this.query.dueFrom) {
      this.conditions.push(gte(tasks.dueDate, new Date(this.query.dueFrom)));
    }

    if (this.query.dueTo) {
      this.conditions.push(lte(tasks.dueDate, new Date(this.query.dueTo)));
    }

    if (this.query.createdFrom) {
      this.conditions.push(
        gte(tasks.createdAt, new Date(this.query.createdFrom)),
      );
    }

    if (this.query.createdTo) {
      this.conditions.push(
        lte(tasks.createdAt, new Date(this.query.createdTo)),
      );
    }
  }

  build() {
    this.visibilityFilter();
    this.queryFilter();
    return and(...this.conditions);
  }
}
