import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";

import { userSchema } from "@mimir/backend/core/user/domain/user";
import { EventBridgeUserEvents } from "@mimir/backend/core/user/infra/event-bridge.user.events";
import { PostgresUserRepository } from "@mimir/backend/core/user/infra/postgres.user.repository";
import { CreateUser } from "@mimir/backend/core/user/use-cases/create-user";

import { ConsoleLogger } from "@mimir/backend/lib/console-logger";

export const createUserHandlers = createFactory().createHandlers(
  zValidator(
    "json",
    userSchema.pick({
      email: true,
    }),
  ),
  async (c) => {
    const body = c.req.valid("json");
    const createUserUseCase = new CreateUser(
      new ConsoleLogger(),
      new PostgresUserRepository(),
      new EventBridgeUserEvents(),
    );
    const user = await createUserUseCase.onRequest(body);

    return c.json(user.toResponse());
  },
);
