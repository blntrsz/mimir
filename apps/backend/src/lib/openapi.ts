import { z } from "@hono/zod-openapi";

import { InternalServerException } from "./exception";

export const getBaseErrorSchema = (description: string) => ({
  content: {
    "application/json": {
      schema: z.object({
        errors: z.array(
          z.object({
            id: z.string().uuid(),
            title: z.string(),
            code: z.string(),
          }),
        ),
      }),
    },
  },
  description,
});

export const badRequestError = {
  400: {
    content: {
      "application/json": {
        schema: z
          .object({
            success: z.literal(false),
            error: z.object({
              issues: z.array(
                z.object({
                  code: z.string(),
                  expected: z.string(),
                  received: z.string(),
                  path: z.array(z.string()),
                  message: z.string(),
                }),
              ),
              name: z.string(),
            }),
          })
          .openapi("Bad Request"),
      },
    },
    description: "Bad request",
  },
} as object;

export const internalServerError = {
  500: {
    content: {
      "application/json": {
        schema: new InternalServerException()
          .toDoc("Internal Server Error")
          .content["application/json"].schema.openapi("Internal Server Error"),
      },
    },
    description: new InternalServerException().toDoc("Internal Server Error")
      .description,
  },
} as object;
