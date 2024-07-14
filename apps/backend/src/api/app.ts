import { randomUUID } from "node:crypto";

import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { createTask } from "@mimir/backend/core/task/app/create-task.action";
import { findAllTaskPaginated } from "@mimir/backend/core/task/app/find-all-task-paginated.query";
import { findOneTaskById } from "@mimir/backend/core/task/app/find-one-task-by-id.query";
import { Task } from "@mimir/backend/core/task/domain/task";
import { createUser } from "@mimir/backend/core/user/app/create-user.action";
import { User } from "@mimir/backend/core/user/domain/user";

import { InternalServerException } from "@mimir/backend/lib/exception";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";
import { withRequestContext } from "@mimir/backend/lib/request.context";

export const app = new OpenAPIHono();

app.use("/*", cors());
app.use(async (_, next) => {
  await withRequestContext(
    {
      requestId: randomUUID(),
      "x-correlation-id": randomUUID(),
      "x-correlation-trace-id": randomUUID(),
    },
    async () => {
      await next();
    },
  );
});
app.onError((error, c) => {
  PinoLogger.instance.error("Internal Server Error", { error });

  return c.json(new InternalServerException().toResponse(), 500);
});
app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Mimir",
  },
});
app.get("/swagger", swaggerUI({ url: "/openapi", persistAuthorization: true }));
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const route = app
  .route(`/${Task.type}`, createTask)
  .route(`/${Task.type}`, findOneTaskById)
  .route(`/${Task.type}`, findAllTaskPaginated)
  .route(`/${User.type}`, createUser);

export type AppType = typeof route;
