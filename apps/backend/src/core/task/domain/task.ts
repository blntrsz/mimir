import { z } from "zod";

import { Entity, timestamps } from "@mimir/backend/lib/entity";

export const taskSchema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  description: z.string(),
  done_at: z.date().optional(),
  ...timestamps,
});

export type TaskSchema = z.infer<typeof taskSchema>;

export class Task implements Entity {
  static readonly type = "tasks";

  constructor(private readonly props: z.infer<typeof taskSchema>) {}

  toProps() {
    return this.props;
  }

  toResponse() {
    return {
      id: this.props.id,
      type: Task.type,
      attributes: {
        user_id: this.props.user_id,
        description: this.props.description,
        done_at: this.props.done_at?.toString(),
      },
    };
  }
}
