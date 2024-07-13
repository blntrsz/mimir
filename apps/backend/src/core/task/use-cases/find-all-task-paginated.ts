import { Task } from "@mimir/backend/core/task/domain/task";
import { TaskRepository } from "@mimir/backend/core/task/domain/task.repository";

import { Logger } from "@mimir/backend/lib/logger";
import { Paginated, PaginatedQueryParams } from "@mimir/backend/lib/paginated";

export type FindAllTaskPaginatedRequest = PaginatedQueryParams;

export class FindAllTaskPaginated {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {}

  async onRequest(
    request: FindAllTaskPaginatedRequest,
  ): Promise<Paginated<Task>> {
    this.logger.debug("Create task request", request);

    try {
      const tasks = await this.taskRepository.findAllPaginated(request);

      return tasks;
    } catch (error) {
      this.logger.error("Failed to create task", { error });
      throw error;
    }
  }
}
