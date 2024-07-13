import { Hono } from "hono";

import { createUserHandlers } from "@mimir/backend/core/user/app/create-user.action";
import { getUserByEmailHandlers } from "@mimir/backend/core/user/app/get-user-by-email.query";

export const user = new Hono()
  .post("/", ...createUserHandlers)
  .get("/by-email/:email", ...getUserByEmailHandlers);
