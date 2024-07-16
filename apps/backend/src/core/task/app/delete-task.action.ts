import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { EventBridge } from "@mimir/backend/core/event/infra/event-bridge.event-emittter";
import { Task, taskSchema } from "@mimir/backend/core/task/domain/task";
import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";

import {
  badRequestError,
  internalServerError,
} from "@mimir/backend/lib/openapi";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";

import { DeleteTask } from "../use-cases/delete-task";

const route = createRoute({
  method: "delete",
  path: `/{id}`,
  tags: [Task.type],
  security: [{ Bearer: [] }],
  request: {
    params: taskSchema.pick({
      id: true,
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            data: z.object({
              id: z.string(),
              type: z.string(),
            }),
          }),
        },
      },
      description: "Retrieve the tasks paginated",
    },
    ...badRequestError,
    ...internalServerError,
  },
});

export const deleteTask = new OpenAPIHono().openapi(route, async (c) => {
  const param = c.req.valid("param");
  const useCase = new DeleteTask(
    PinoLogger.instance,
    new EventBridge(),
    new PostgresTaskRepository(),
  );
  await useCase.onRequest(param);

  return c.json(
    {
      data: {
        type: Task.type,
        id: param.id,
      },
    },
    200,
  );
});
