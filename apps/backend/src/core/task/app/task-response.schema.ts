import { randomUUID } from "node:crypto";

import { z } from "@hono/zod-openapi";

import { Task } from "@mimir/backend/core/task/domain/task";

export const taskResponseSchema = z
  .object({
    id: z.string().openapi({
      description: "The id of the Task.",
    }),
    type: z.string().openapi({
      description: "Type of the Task",
    }),
    attributes: z.object({
      user_id: z.string().nullable().openapi({
        description:
          "The User's id who is the assignee of the task, `null` if not assigneed to anyone.",
      }),
      description: z.string().openapi({
        description: "The description of the Task.",
      }),
      done_at: z.string().nullable().openapi({
        description: "The timestamp when the task is done.",
      }),
    }),
  })
  .openapi("Task")
  .openapi({
    example: {
      id: randomUUID(),
      type: Task.type,
      attributes: {
        user_id: null,
        done_at: null,
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
        done_at: null,
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
        done_at: randomUUID(),
        description: "My task with user_id and done task",
      },
    },
  });
