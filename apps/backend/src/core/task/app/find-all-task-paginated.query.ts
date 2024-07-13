import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";

import { PostgresTaskRepository } from "@mimir/backend/core/task/infra/postgres.task.repository";
import { FindAllTaskPaginated } from "@mimir/backend/core/task/use-cases/find-all-task-paginated";

import { paginatedQueryParamsSchema } from "@mimir/backend/lib/paginated";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";

export const findAllTaskPaginatedHandlers = createFactory().createHandlers(
  zValidator("query", paginatedQueryParamsSchema),
  async (c) => {
    const query = c.req.valid("query");
    const createTaskUseCase = new FindAllTaskPaginated(
      PinoLogger.instance,
      new PostgresTaskRepository(),
    );
    const tasks = await createTaskUseCase.onRequest(query);

    return c.json(tasks.data.map((task) => task.toResponse()));
  },
);
