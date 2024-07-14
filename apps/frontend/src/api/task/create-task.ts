import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { QueryClient } from "@tanstack/react-query";
import {
  ActionFunctionArgs,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router-dom";
import { z } from "zod";

import { client } from "@mimir/frontend/api/http";

import { taskKeys } from "./keys";

export const CREATE_TASK_ACTION = "create-task";

const schema = z.object({
  user_id: z.string().optional(),
  description: z.string().min(5),
  _action: z.literal(CREATE_TASK_ACTION),
});

export type CreateTaskActionError = z.typeToFlattenedError<typeof schema>;

export async function createTaskAction(
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

  await client.tasks.$post({
    json: submission.value,
  });

  queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

  return redirect(`/`);
}

export function useCreateTaskForm() {
  const { id } = useLoaderData() as { id: number };
  const lastResult = useActionData() as any;
  return useForm({
    id: `${CREATE_TASK_ACTION}-${id}`,
    shouldValidate: "onBlur",
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });
}
