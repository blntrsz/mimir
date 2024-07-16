import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { QueryClient } from "@tanstack/react-query";
import {
  ActionFunctionArgs,
  json,
  useActionData,
  useLoaderData,
} from "react-router-dom";
import { z } from "zod";

import { client } from "@mimir/frontend/api/http";

import { taskKeys } from "./keys";

export const UPDATE_TASK_ACTION = "update-task";

const schema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  status: z.enum(["to_do", "in_progress", "done"]).optional(),
  description: z.string().min(5),
  _action: z.literal(UPDATE_TASK_ACTION),
});

export type UpdateTaskActionError = z.typeToFlattenedError<typeof schema>;

export async function updateTaskAction(
  args: ActionFunctionArgs,
  queryClient: QueryClient,
) {
  const formData = await args.request.formData();
  const submission = parseWithZod(formData, { schema });

  if (formData.get("_action") !== schema.shape._action.value) {
    return;
  }

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const result = await client.tasks[":id"].$put({
    param: {
      id: submission.value.id,
    },
    json: submission.value,
  });

  await queryClient.invalidateQueries({
    queryKey: taskKeys.detail(submission.value.id),
  });
  queryClient.invalidateQueries({
    queryKey: taskKeys.lists(),
  });

  return json({
    result: await result.json(),
  });
}

export function useUpdateTaskForm() {
  const { id } = useLoaderData() as { id: number };
  const lastResult = useActionData() as any;
  return useForm({
    id: `${UPDATE_TASK_ACTION}-${id}`,
    shouldValidate: "onBlur",
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });
}
