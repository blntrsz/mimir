import { Task, TaskSchema } from "@mimir/backend/core/task/domain/task";
import { TaskEventEmitter } from "@mimir/backend/core/task/domain/task.events";
import { TaskRepository } from "@mimir/backend/core/task/domain/task.repository";
import { UserSchema } from "@mimir/backend/core/user/domain/user";
import { UserRepository } from "@mimir/backend/core/user/domain/user.repository";

import { createTransaction } from "@mimir/backend/lib/db";
import { NotFoundException } from "@mimir/backend/lib/exception";
import { Logger } from "@mimir/backend/lib/logger";

export type CreateTaskRequest = {
  task: Pick<TaskSchema, "description" | "user_id">;
  user: Pick<UserSchema, "id">;
};

export class CreateTask {
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
    private readonly taskEventEmitter: TaskEventEmitter,
    private readonly userRepository: UserRepository,
  ) {}

  async onRequest(request: CreateTaskRequest): Promise<Task> {
    this.logger.debug("Create task request", request);

    try {
      const task = await createTransaction(async () => {
        const user = await this.userRepository.byId(request.user.id);
        this.logger.debug("User requested", { user });

        if (!user) {
          throw new NotFoundException("User");
        }

        const newTask = await this.taskRepository.insert(request.task);
        this.logger.debug("Task created", { task: task.toResponse() });

        return newTask;
      });

      await this.taskEventEmitter.emitTaskCreated(task);
      this.logger.debug("Task created event has been emitted", {
        task: task.toResponse(),
      });

      return task;
    } catch (error) {
      this.logger.error("Failed to create task", { error });
      throw error;
    }
  }
}
