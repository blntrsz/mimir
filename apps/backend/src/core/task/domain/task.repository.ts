import { Paginated, PaginatedQueryParams } from "@mimir/backend/lib/paginated";

import { Task, TaskSchema } from "./task";

export interface TaskRepository {
  insert(props: Pick<TaskSchema, "description" | "user_id">): Promise<Task>;
  findOneById(id: TaskSchema["id"]): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<Task>>;
  delete(id: TaskSchema["id"]): Promise<void>;
}
