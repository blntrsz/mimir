import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { QueryClient } from "@tanstack/react-query";
import { json, redirect, useActionData, useLoaderData } from "react-router-dom";
import { z } from "zod";

import { client } from "@mimir/frontend/api/http";

import { taskKeys } from "./keys";

export const DELETE_TASK_ACTION = "delete-task";

const schema = z.object({
  id: z.string(),
  _action: z.literal(DELETE_TASK_ACTION),
});

export type DeleteTaskActionError = z.typeToFlattenedError<typeof schema>;

export async function deleteTaskAction(
  formData: FormData,
  queryClient: QueryClient,
) {
  const submission = parseWithZod(formData, { schema });

  if (formData.get("_action") !== schema.shape._action.value) {
    return;
  }

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  await client.tasks[":id"].$delete({
    param: {
      id: submission.value.id,
    },
  });

  queryClient.invalidateQueries({
    queryKey: taskKeys.lists(),
  });

  return redirect("/");
}

export function useDeleteTaskForm() {
  const { id } = useLoaderData() as { id: number };
  const lastResult = useActionData() as any;
  return useForm({
    id: `${DELETE_TASK_ACTION}-${id}`,
    shouldValidate: "onBlur",
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });
}
