import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { Task, taskSchema } from "@mimir/backend/core/task/domain/task";
import { EventBridgeTaskEvents } from "@mimir/backend/core/task/infra/event-bridge.task.events";
import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";
import { CreateTask } from "@mimir/backend/core/task/use-cases/create-task";
import { PostgresUserRepository } from "@mimir/backend/core/user/infra/postgres.user.repository";

import { badRequestError } from "@mimir/backend/lib/openapi";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";

import { taskResponseSchema } from "./task-response.schema";

const route = createRoute({
  method: "post",
  path: `/`,
  tags: [Task.type],
  security: [{ Bearer: [] }],
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
    ...badRequestError,
  },
});

export const createTask = new OpenAPIHono().openapi(route, async (c) => {
  const body = c.req.valid("json");
  const createTaskUseCase = new CreateTask(
    PinoLogger.instance,
    new PostgresTaskRepository(),
    new EventBridgeTaskEvents(),
    new PostgresUserRepository(),
  );
  const task = await createTaskUseCase.onRequest(body);

  return c.json(task.toResponse());
});
