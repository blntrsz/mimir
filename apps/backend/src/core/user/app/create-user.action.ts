import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import { EventBridge } from "@mimir/backend/core/event/infra/event-bridge.event-emittter";
import { User, userSchema } from "@mimir/backend/core/user/domain/user";
import { PostgresUserRepository } from "@mimir/backend/core/user/infra/postgres.user.repository";
import { CreateUser } from "@mimir/backend/core/user/use-cases/create-user";

import { AlreadyExistsException } from "@mimir/backend/lib/exception";
import {
  badRequestError,
  internalServerError,
} from "@mimir/backend/lib/openapi";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";

import { userResponseSchema } from "./user-response.schema";

const route = createRoute({
  method: "post",
  path: `/`,
  tags: [User.type],
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: userSchema.pick({
            email: true,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
      description: "Retrieve the tasks paginated",
    },
    409: new AlreadyExistsException("User").toDoc("The User already exists."),
    ...badRequestError,
    ...internalServerError,
  },
});

export const createUser = new OpenAPIHono().openapi(route, async (c) => {
  const body = c.req.valid("json");
  const createUserUseCase = new CreateUser(
    PinoLogger.instance,
    new EventBridge(),
    new PostgresUserRepository(),
  );
  const [user, error] = await createUserUseCase.onRequest(body);

  if (error) {
    return c.json(error.toResponse(), 409);
  }

  return c.json(
    {
      data: user.toResponse(),
    },
    200,
  );
});
