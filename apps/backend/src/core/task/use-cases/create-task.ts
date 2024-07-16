import { EventEmitter } from "@mimir/backend/core/event/domain/event-emitter";
import { Task, TaskSchema } from "@mimir/backend/core/task/domain/task";
import { TaskEvents } from "@mimir/backend/core/task/domain/task.events";
import { TaskRepository } from "@mimir/backend/core/task/domain/task.repository";
import { UserRepository } from "@mimir/backend/core/user/domain/user.repository";

import { createTransaction } from "@mimir/backend/lib/db";
import { Err, NotFoundException, Ok } from "@mimir/backend/lib/exception";
import { Logger } from "@mimir/backend/lib/logger";

export type CreateTaskRequest = Pick<TaskSchema, "description" | "user_id">;

export class CreateTask {
  constructor(
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter,
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async onRequest(
    request: CreateTaskRequest,
  ): Promise<Ok<Task> | Err<NotFoundException>> {
    this.logger.debug("Create task request", request);

    try {
      const transactionResult = await createTransaction(async () => {
        if (request.user_id) {
          const user = await this.userRepository.byId(request.user_id);
          this.logger.debug("User requested", { user });

          if (!user) {
            return new NotFoundException("User");
          }
        }

        const newTask = await this.taskRepository.insert(request);
        this.logger.debug("Task created", { task: newTask.toProps() });

        return newTask;
      });

      if (transactionResult instanceof NotFoundException) {
        return [undefined, transactionResult];
      }

      await this.eventEmitter.publish(TaskEvents.createdV1(transactionResult));
      this.logger.debug("Task created event has been emitted", {
        task: transactionResult.toResponse(),
      });

      return [transactionResult, undefined];
    } catch (error) {
      this.logger.error("Failed to create task", { error });
      throw error;
    }
  }
}
