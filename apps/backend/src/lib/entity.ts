import { z } from "@hono/zod-openapi";

export interface Entity {
  toResponse(): unknown;
  toProps(): unknown;
}

export const timestamps = {
  updated_at: z.date().optional().openapi({
    description: "Update At",
  }),
  created_at: z.date().openapi({
    description: "Update At",
  }),
};
