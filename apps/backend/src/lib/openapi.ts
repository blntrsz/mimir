import { z } from "@hono/zod-openapi";

export const badRequestError = {
  400: {
    content: {
      "application/json": {
        schema: z.object({
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
        }),
      },
    },
    description: "Bad request",
  },
} as object;
