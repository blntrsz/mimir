import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";
import { z } from "zod";

import { taskSchema } from "@mimir/backend/core/task/domain/task";
import { EventBridgeTaskEvents } from "@mimir/backend/core/task/infra/event-bridge.task.events";
import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";
import { CreateTask } from "@mimir/backend/core/task/use-cases/create-task";
import { userSchema } from "@mimir/backend/core/user/domain/user";
import { PostgresUserRepository } from "@mimir/backend/core/user/infra/postgres.user.repository";

import { ConsoleLogger } from "@mimir/backend/lib/console-logger";

export const createTaskHandlers = createFactory().createHandlers(
  zValidator(
    "json",
    z.object({
      task: taskSchema.pick({
        user_id: true,
        description: true,
      }),
      user: userSchema.pick({
        id: true,
      }),
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");
    const createTaskUseCase = new CreateTask(
      new ConsoleLogger(),
      new PostgresTaskRepository(),
      new EventBridgeTaskEvents(),
      new PostgresUserRepository(),
    );
    const task = await createTaskUseCase.onRequest({
      user: body.user,
      task: body.task,
    });

    return c.json(task.toResponse());
  },
);
