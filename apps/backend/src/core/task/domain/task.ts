import { z } from "@hono/zod-openapi";

import { Entity, id, timestamps } from "@mimir/backend/lib/entity";

export const taskSchema = z.object({
  ...id,
  user_id: z
    .string()
    .optional()
    .nullable()
    .transform((user_id) => user_id ?? null)
    .openapi({
      description:
        "The `User`'s id who is the assignee of the task, `null` if not assigneed to anyone.",
    }),
  description: z.string().openapi({
    description: "The description of the `Task`",
  }),
  status: z.enum(["done", "in_progress", "to_do"]).default("to_do").openapi({
    description: "The status of the `Task`",
  }),
  ...timestamps,
});

export type TaskSchema = z.infer<typeof taskSchema>;

export class Task extends Entity<TaskSchema> {
  static readonly type = "tasks";

  constructor(readonly props: TaskSchema) {
    super();
  }

  toEvent() {
    return {
      id: this.props.id,
      user_id: this.props.user_id,
      description: this.props.description,
      status: this.props.status,
    };
  }

  toResponse() {
    return {
      id: this.props.id,
      type: Task.type,
      attributes: {
        user_id: this.props.user_id,
        description: this.props.description,
        status: this.props.status,
      },
    };
  }
}
