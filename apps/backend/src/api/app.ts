import { randomUUID } from "node:crypto";

import { Hono } from "hono";
import { cors } from "hono/cors";

import { Task } from "@mimir/backend/core/task/domain/task";
import { User } from "@mimir/backend/core/user/domain/user";

import { Exception } from "@mimir/backend/lib/exception";
import { withRequestContext } from "@mimir/backend/lib/request.context";

import { task } from "./routes/task";
import { user } from "./routes/user";

export const app = new Hono();

app.use("/*", cors());
app.use(async (_, next) => {
  await withRequestContext(
    {
      awsRequestId: randomUUID(),
      "x-correlation-id": randomUUID(),
      "x-correlation-trace-id": randomUUID(),
    },
    async () => {
      await next();
    },
  );
});
app.onError((err, c) => {
  if (err instanceof Exception) {
    return err.toResponse();
  }

  return c.json(
    {
      message: "Internal Server Error",
    },
    500,
  );
});

const route = app.route(`/${User.type}`, user).route(`/${Task.type}`, task);

export type AppType = typeof route;
