import { BaseRepository } from "@mimir/backend/lib/db";

import { Task, taskSchema } from "./task";

export interface TaskRepository
  extends BaseRepository<typeof taskSchema, Task> {}
