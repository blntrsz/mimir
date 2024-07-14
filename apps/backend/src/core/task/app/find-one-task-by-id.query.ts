import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { Task } from "@mimir/backend/core/task/domain/task";
import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";
import { FindOneTaskById } from "@mimir/backend/core/task/use-cases/find-one-task-by-id";

import { NotFoundException } from "@mimir/backend/lib/exception";
import {
  badRequestError,
  internalServerError,
} from "@mimir/backend/lib/openapi";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";

import { taskResponseSchema } from "./task-response.schema";

const route = createRoute({
  method: "get",
  path: `/{task_id}`,
  tags: [Task.type],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      task_id: z.string().uuid(),
    }),
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
    404: new NotFoundException("User").toDoc("The Task does not exists."),
    ...badRequestError,
    ...internalServerError,
  },
});

export const findOneTaskById = new OpenAPIHono().openapi(route, async (c) => {
  const param = c.req.valid("param");
  const createTaskUseCase = new FindOneTaskById(
    PinoLogger.instance,
    new PostgresTaskRepository(),
  );
  const [task, error] = await createTaskUseCase.onRequest({
    id: param.task_id,
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
