import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { User, userSchema } from "@mimir/backend/core/user/domain/user";
import { EventBridgeUserEvents } from "@mimir/backend/core/user/infra/event-bridge.user.events";
import { PostgresUserRepository } from "@mimir/backend/core/user/infra/postgres.user.repository";
import { CreateUser } from "@mimir/backend/core/user/use-cases/create-user";

import { AlreadyExistsException } from "@mimir/backend/lib/exception";
import { PinoLogger } from "@mimir/backend/lib/pino-logger";

import { userResponseSchema } from "./user-response.schema";

const route = createRoute({
  method: "post",
  path: `/`,
  tags: [User.type],
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
    409: {
      content: {
        "application/json": {
          schema: z.object({
            errors: z.array(
              z.object({
                id: z.string().uuid(),
                title: z.literal(new AlreadyExistsException("User").message),
                code: z.literal(new AlreadyExistsException("User").code),
              }),
            ),
          }),
        },
      },
      description: "The User already exists",
    },
  },
});

export const createUser = new OpenAPIHono().openapi(route, async (c) => {
  const body = c.req.valid("json");
  const createUserUseCase = new CreateUser(
    PinoLogger.instance,
    new PostgresUserRepository(),
    new EventBridgeUserEvents(),
  );
  const [user, error] = await createUserUseCase.onRequest(body);

  if (error) {
    return c.json(error.toResponse(), 409);
  }

  return c.json(user.toResponse(), 200);
});
