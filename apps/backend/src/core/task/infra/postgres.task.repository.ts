import { Task, taskSchema } from "@mimir/backend/core/task/domain/task";
import { TaskRepository } from "@mimir/backend/core/task/domain/task.repository";

import { BaseRepository } from "@mimir/backend/lib/db";

export class PostgresTaskRepository
  extends BaseRepository<typeof taskSchema, Task>
  implements TaskRepository
{
  protected tableName = Task.type;
  protected schema = taskSchema;
  protected toEntity = Task.toEntity;
}
