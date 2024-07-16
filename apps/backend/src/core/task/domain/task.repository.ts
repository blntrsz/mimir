import { BaseRepository } from "@mimir/backend/lib/db";
import { Paginated, PaginatedQueryParams } from "@mimir/backend/lib/paginated";

import { Task, TaskSchema, taskSchema } from "./task";

export interface TaskRepository
  extends BaseRepository<typeof taskSchema, Task> {
  findOneById(id: TaskSchema["id"]): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<Task>>;
  delete(id: TaskSchema["id"]): Promise<void>;
  update(
    params: Partial<Pick<TaskSchema, "description" | "user_id">> &
      Pick<TaskSchema, "id"> & {
        done_at?: boolean;
      },
  ): Promise<Task | null>;
}
