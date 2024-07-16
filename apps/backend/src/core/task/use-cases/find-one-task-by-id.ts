import { Task, TaskSchema } from "@mimir/backend/core/task/domain/task";
import { TaskRepository } from "@mimir/backend/core/task/domain/task.repository";

import { Err, NotFoundException, Ok } from "@mimir/backend/lib/exception";
import { Logger } from "@mimir/backend/lib/logger";

type Request = Pick<TaskSchema, "id">;

export class FindOneTaskById {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {}

  async onRequest(
    request: Request,
  ): Promise<Ok<Task> | Err<NotFoundException>> {
    this.logger.debug("Find one task by id", request);

    try {
      const task = await this.taskRepository.findOneById(request.id);

      if (!task) {
        return [undefined, new NotFoundException("Task")];
      }

      return [task, undefined];
    } catch (error) {
      this.logger.error("Failed to create task", { error });
      throw error;
    }
  }
}
