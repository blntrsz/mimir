import { z } from "@hono/zod-openapi";

const userSchema = z
  .object({
    id: z.string().openapi({
      description: "The id of the User.",
    }),
    type: z.string().openapi({
      description: "Type of the User",
    }),
    attributes: z.object({
      email: z.string().email().openapi({
        description: "The User's email",
      }),
    }),
  })
  .openapi("User");

export const userResponseSchema = z.object({
  data: userSchema,
});
