import { Task, TaskSchema } from "@mimir/backend/core/task/domain/task";
import { TaskEventEmitter } from "@mimir/backend/core/task/domain/task.events";
import { TaskRepository } from "@mimir/backend/core/task/domain/task.repository";
import { UserRepository } from "@mimir/backend/core/user/domain/user.repository";

import { createTransaction } from "@mimir/backend/lib/db";
import { Err, NotFoundException, Ok } from "@mimir/backend/lib/exception";
import { Logger } from "@mimir/backend/lib/logger";

export type UpdateTaskRequest = Partial<
  Pick<TaskSchema, "description" | "user_id">
> &
  Pick<TaskSchema, "id"> & {
    done_at?: boolean;
  };

export class UpdateTask {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
    private readonly taskEventEmitter: TaskEventEmitter,
    private readonly userRepository: UserRepository,
  ) {}

  async onRequest(
    request: UpdateTaskRequest,
  ): Promise<Ok<Task> | Err<NotFoundException>> {
    this.logger.debug("Update task request", request);

    try {
      const transactionResult = await createTransaction(async () => {
        if (request.user_id) {
          const user = await this.userRepository.byId(request.user_id);
          this.logger.debug("User requested", { user });

          if (!user) {
            return new NotFoundException("User");
          }
        }

        const prevTask = await this.taskRepository.findOneById(request.id);
        this.logger.debug("Previous Task requested", {
          task: prevTask?.toResponse(),
        });

        if (!prevTask) {
          return new NotFoundException("Task");
        }

        const currentTask = await this.taskRepository.update(request);
        this.logger.debug("Task updated", { task: currentTask?.toResponse() });

        if (!currentTask) {
          return new NotFoundException("Task");
        }

        return {
          prevTask,
          currentTask,
        };
      });

      if (transactionResult instanceof NotFoundException) {
        return [undefined, transactionResult];
      }

      await this.taskEventEmitter.emitTaskUpdated(
        transactionResult.prevTask,
        transactionResult.currentTask,
      );
      this.logger.debug("Task created event has been emitted", {
        prevTask: transactionResult.prevTask.toProps(),
        currentTask: transactionResult.currentTask.toProps(),
      });

      return [transactionResult.currentTask, undefined];
    } catch (error) {
      this.logger.error("Failed to create task", { error });
      throw error;
    }
  }
}
