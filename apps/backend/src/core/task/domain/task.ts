import { z } from "zod";

import { Entity, id, timestamps } from "@mimir/backend/lib/entity";

export const taskSchema = z.object({
  ...id,
  user_id: z
    .string()
    .optional()
    .nullable()
    .transform((user_id) => user_id ?? null),
  description: z.string(),
  done_at: z.date().nullable(),
  ...timestamps,
});

export type TaskSchema = z.infer<typeof taskSchema>;

export class Task extends Entity<TaskSchema> {
  static readonly type = "tasks";

  constructor(readonly props: z.infer<typeof taskSchema>) {
    super();
  }

  private doneAt() {
    return this.props.done_at ? this.props.done_at.toString() : null;
  }

  toEvent() {
    return {
      id: this.props.id,
      user_id: this.props.user_id,
      description: this.props.description,
      done_at: this.doneAt(),
    };
  }

  toResponse() {
    return {
      id: this.props.id,
      type: Task.type,
      attributes: {
        user_id: this.props.user_id,
        description: this.props.description,
        done_at: this.doneAt(),
      },
    };
  }
}
