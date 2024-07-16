import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { Task, taskSchema } from "@mimir/backend/core/task/domain/task";
import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";
import { PostgresUserRepository } from "@mimir/backend/core/user/infra/postgres.user.repository";

import { NotFoundException } from "@mimir/backend/lib/exception";
import {
  badRequestError,
  internalServerError,
} from "@mimir/backend/lib/openapi";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";

import { EventBridge } from "../../event/infra/event-bridge.event-emittter";
import { UpdateTask } from "../use-cases/update-task";
import { taskResponseSchema } from "./task-response.schema";

const route = createRoute({
  method: "put",
  path: `/{id}`,
  tags: [Task.type],
  security: [{ Bearer: [] }],
  request: {
    params: taskSchema.pick({
      id: true,
    }),
    body: {
      content: {
        "application/json": {
          schema: taskSchema
            .pick({
              user_id: true,
              description: true,
              status: true,
            })
            .partial(),
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

export const updateTask = new OpenAPIHono().openapi(route, async (c) => {
  const body = c.req.valid("json");
  const param = c.req.valid("param");
  const createTaskUseCase = new UpdateTask(
    PinoLogger.instance,
    new EventBridge(),
    new PostgresTaskRepository(),
    new PostgresUserRepository(),
  );
  const [task, error] = await createTaskUseCase.onRequest({
    ...param,
    ...body,
  });

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
