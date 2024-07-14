import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";
import { FindAllTaskPaginated } from "@mimir/backend/core/task/use-cases/find-all-task-paginated";

import { badRequestError } from "@mimir/backend/lib/openapi";
import { paginatedQueryParamsSchema } from "@mimir/backend/lib/paginated";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";

import { Task } from "../domain/task";
import { taskResponseSchema } from "./task-response.schema";

const route = createRoute({
  method: "get",
  path: `/`,
  tags: [Task.type],
  security: [{ Bearer: [] }],
  request: {
    query: paginatedQueryParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(taskResponseSchema),
        },
      },
      description: "Retrieve the tasks paginated",
    },
    ...badRequestError,
  },
});

export const findAllTaskPaginated = new OpenAPIHono().openapi(
  route,
  async (c) => {
    const createTaskUseCase = new FindAllTaskPaginated(
      PinoLogger.instance,
      new PostgresTaskRepository(),
    );
    const query = c.req.valid("query");
    const tasks = await createTaskUseCase.onRequest(query);

    return c.json(tasks.data.map((task) => task.toResponse()));
  },
);
