import { z } from "zod";

export interface Entity {
  toResponse(): unknown;
  toProps(): unknown;
}

export const timestamps = {
  updated_at: z.date().optional(),
  created_at: z.date(),
};
