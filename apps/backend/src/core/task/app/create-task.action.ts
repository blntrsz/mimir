import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { Task, taskSchema } from "@mimir/backend/core/task/domain/task";
import { EventBridgeTaskEvents } from "@mimir/backend/core/task/infra/event-bridge.task.events";
import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";
import { CreateTask } from "@mimir/backend/core/task/use-cases/create-task";
import { PostgresUserRepository } from "@mimir/backend/core/user/infra/postgres.user.repository";

import { ConsoleLogger } from "@mimir/backend/lib/console-logger";

import { taskResponseSchema } from "./task-response.schema";

const route = createRoute({
  method: "post",
  path: `/`,
  tags: [Task.type],
  request: {
    body: {
      content: {
        "application/json": {
          schema: taskSchema.pick({
            user_id: true,
            description: true,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: taskResponseSchema,
        },
      },
      description: "Retrieve the tasks paginated",
    },
  },
});

export const createTask = new OpenAPIHono().openapi(route, async (c) => {
  const body = c.req.valid("json");
  const createTaskUseCase = new CreateTask(
    new ConsoleLogger(),
    new PostgresTaskRepository(),
    new EventBridgeTaskEvents(),
    new PostgresUserRepository(),
  );
  const task = await createTaskUseCase.onRequest(body);

  return c.json(task.toResponse());
});
