import { Hono } from "hono";

import { createTaskHandlers } from "@mimir/backend/core/task/app/create-task.action";
import { findAllTaskPaginatedHandlers } from "@mimir/backend/core/task/app/find-all-task-paginated.query";

export const task = new Hono()
  .post("/", ...createTaskHandlers)
  .get(...findAllTaskPaginatedHandlers);
