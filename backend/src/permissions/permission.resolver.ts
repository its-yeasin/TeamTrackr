import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { Request } from 'express';
import type { TPgDatabase } from 'src/common/interfaces/db';
import { DATABASE_TOKEN } from 'src/database/database.module';
import { tasks } from 'src/database/schema';

@Injectable()
export class ProjectContextResolver {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: TPgDatabase) {}

  async resolveProjectId(
    request: Request<{
      projectId?: string;
      taskId?: string;
    }>,
  ): Promise<string | null> {
    if (request.params.projectId) {
      return request.params.projectId;
    }

    if (request.params.taskId) {
      return await this.getProjectIdFromTask(request.params.taskId);
    }

    return null;
  }

  private async getProjectIdFromTask(taskId: string): Promise<string | null> {
    const [task] = await this.db
      .select({
        projectId: tasks.projectId,
      })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
      .limit(1);

    return task.projectId || null;
  }
}
