import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { EventBridge } from "@mimir/backend/core/event/infra/event-bridge.event-emittter";
import { Task, taskSchema } from "@mimir/backend/core/task/domain/task";
import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";
import { CreateTask } from "@mimir/backend/core/task/use-cases/create-task";
import { PostgresUserRepository } from "@mimir/backend/core/user/infra/postgres.user.repository";

import { NotFoundException } from "@mimir/backend/lib/exception";
import {
  badRequestError,
  internalServerError,
} from "@mimir/backend/lib/openapi";
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
    404: new NotFoundException("User").toDoc(
      "The User's id is not found for the assignment.",
    ),
    ...badRequestError,
    ...internalServerError,
  },
});

export const createTask = new OpenAPIHono().openapi(route, async (c) => {
  const body = c.req.valid("json");
  const createTaskUseCase = new CreateTask(
    PinoLogger.instance,
    new EventBridge(),
    new PostgresTaskRepository(),
    new PostgresUserRepository(),
  );
  const [task, error] = await createTaskUseCase.onRequest(body);

  if (error) {
    return c.json(error.toResponse(), 404);
  }

  return c.json(
    {
      data: task.toResponse(),
    },
    200,
  );
});
