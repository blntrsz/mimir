import { zValidator } from "@hono/zod-validator";
import { createFactory } from "hono/factory";

import { userSchema } from "@mimir/backend/core/user/domain/user";
import { PostgresUserRepository } from "@mimir/backend/core/user/infra/postgres.user.repository";
import { GetUserByEmail } from "@mimir/backend/core/user/use-cases/get-user-by-email";

import { PinoLogger } from "@mimir/backend/lib/pino-logger";

export const getUserByEmailHandlers = createFactory().createHandlers(
  zValidator(
    "param",
    userSchema.pick({
      email: true,
    }),
  ),
  async (c) => {
    const body = c.req.valid("param");
    const createUserUseCase = new GetUserByEmail(
      PinoLogger.instance,
      new PostgresUserRepository(),
    );
    const [user, error] = await createUserUseCase.onRequest(body);

    if (error) {
      return c.json(error.toResponse(), 404);
    }

    return c.json(user.toResponse());
  },
);
