import { EventEmitter } from "@mimir/backend/core/event/domain/event-emitter";
import { TaskSchema } from "@mimir/backend/core/task/domain/task";
import { TaskEvents } from "@mimir/backend/core/task/domain/task.events";
import { TaskRepository } from "@mimir/backend/core/task/domain/task.repository";

import { Logger } from "@mimir/backend/lib/logger";

export type Request = Pick<TaskSchema, "id">;

export class DeleteTask {
  constructor(
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter,
    private readonly taskRepository: TaskRepository,
  ) {}

  async onRequest(request: Request): Promise<void> {
    this.logger.debug("Delete task request", request);

    try {
      await this.taskRepository.delete(request.id);

      await this.eventEmitter.publish(TaskEvents.deletedV1(request.id));
      this.logger.debug("Task deleted event has been emitted", {
        id: request.id,
      });
    } catch (error) {
      this.logger.error("Failed to delete task", { error });
      throw error;
    }
  }
}
