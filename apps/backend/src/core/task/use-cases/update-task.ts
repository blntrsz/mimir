import {
  Event,
  EventEmitter,
} from "@mimir/backend/core/event/domain/event-emitter";
import { Task, TaskSchema } from "@mimir/backend/core/task/domain/task";
import { TaskEvents } from "@mimir/backend/core/task/domain/task.events";
import { TaskRepository } from "@mimir/backend/core/task/domain/task.repository";
import { UserRepository } from "@mimir/backend/core/user/domain/user.repository";

import { createTransaction } from "@mimir/backend/lib/db";
import { Err, NotFoundException, Ok } from "@mimir/backend/lib/exception";
import { Logger } from "@mimir/backend/lib/logger";

type Request = Partial<Pick<TaskSchema, "description" | "user_id" | "status">> &
  Pick<TaskSchema, "id"> & {
    done_at?: boolean;
  };

export class UpdateTask {
  constructor(
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter,
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async onRequest(
    request: Request,
  ): Promise<Ok<Task> | Err<NotFoundException>> {
    this.logger.debug("Update task request", request);

    try {
      const transactionResult = await createTransaction(async () => {
        if (request.user_id) {
          const user = await this.userRepository.findOneById(request.user_id);
          this.logger.debug("User requested", { user });

          if (!user) {
            return new NotFoundException("User");
          }
        }

        const previousTask = await this.taskRepository.findOneById(request.id);
        this.logger.debug("Previous Task requested", {
          task: previousTask?.toResponse(),
        });

        if (!previousTask) {
          return new NotFoundException("Task");
        }

        const currentTask = await this.taskRepository.update(request);
        this.logger.debug("Task updated", { task: currentTask?.toResponse() });

        if (!currentTask) {
          return new NotFoundException("Task");
        }

        return {
          previousTask,
          currentTask,
        };
      });

      if (transactionResult instanceof NotFoundException) {
        return [undefined, transactionResult];
      }

      const events: Event[] = [];

      if (request.user_id) {
        events.push(
          TaskEvents.assignedV1(
            transactionResult.previousTask,
            transactionResult.currentTask,
          ),
        );
      }
      if (request.description) {
        events.push(
          TaskEvents.descriptionUpdatedV1(
            transactionResult.previousTask,
            transactionResult.currentTask,
          ),
        );
      }
      if (request.status) {
        events.push(
          TaskEvents.statusUpdatedV1(
            transactionResult.previousTask,
            transactionResult.currentTask,
          ),
        );
      }

      await Promise.all(
        events.map((event) => this.eventEmitter.publish(event)),
      );
      this.logger.debug("Task updated events has been emitted", {
        events,
      });

      return [transactionResult.currentTask, undefined];
    } catch (error) {
      this.logger.error("Failed to update task", { error });
      throw error;
    }
  }
}
