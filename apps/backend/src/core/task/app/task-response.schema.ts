import { randomUUID } from "node:crypto";

import { z } from "@hono/zod-openapi";

import { Task, taskSchema } from "@mimir/backend/core/task/domain/task";

const dataSchema = z
  .object({
    id: z.string().openapi({
      description: "The id of the Task.",
    }),
    type: z.string().openapi({
      description: "Type of the Task",
    }),
    attributes: taskSchema.pick({
      description: true,
      status: true,
      user_id: true,
    }),
  })
  .openapi("Task")
  .openapi({
    example: {
      id: randomUUID(),
      type: Task.type,
      attributes: {
        user_id: null,
        status: "to_do",
        description: "Task newly created",
      },
    },
  })
  .openapi({
    example: {
      id: randomUUID(),
      type: Task.type,
      attributes: {
        user_id: randomUUID(),
        status: "in_progress",
        description: "My task with user_id",
      },
    },
  })
  .openapi({
    example: {
      id: randomUUID(),
      type: Task.type,
      attributes: {
        user_id: randomUUID(),
        status: "done",
        description: "My task with user_id and done task",
      },
    },
  });

export const taskResponseSchema = z.object({
  data: dataSchema,
});
export type TaskResponseSchema = z.infer<typeof taskResponseSchema>;
export const tasksResponseSchema = z.object({
  links: z.object({
    prev: z.string().nullable(),
    next: z.string().nullable(),
  }),
  data: z.array(dataSchema),
});
export type TasksResponseSchema = z.infer<typeof tasksResponseSchema>;
