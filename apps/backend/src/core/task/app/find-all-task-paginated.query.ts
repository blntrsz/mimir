import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { Task } from "@mimir/backend/core/task/domain/task";
import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";
import { FindAllTaskPaginated } from "@mimir/backend/core/task/use-cases/find-all-task-paginated";

import {
  badRequestError,
  internalServerError,
} from "@mimir/backend/lib/openapi";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";
import { queryParams, QueryParamsEnum } from "@mimir/backend/lib/query-params";

import { tasksResponseSchema } from "./task-response.schema";

const route = createRoute({
  method: "get",
  path: `/`,
  tags: [Task.type],
  security: [{ Bearer: [] }],
  request: {
    query: queryParams.pick({
      [QueryParamsEnum.PAGE_SIZE]: true,
      [QueryParamsEnum.PAGE_NUMBER]: true,
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: tasksResponseSchema,
        },
      },
      description: "Retrieve the tasks paginated",
    },
    ...badRequestError,
    ...internalServerError,
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

    return c.json(tasks.toJsonAPI(c.req.raw));
  },
);
