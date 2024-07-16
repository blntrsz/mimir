import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "react-router-dom";

import { queryClient } from "@mimir/frontend/api/queryClient";
import {
  findOneTaskByIdLoader,
  useFindOneTaskByIdQuery,
} from "@mimir/frontend/api/task/find-one-task-by-id";

import { updateTaskAction } from "../api/task/update-task";
import { UpdateTaskForm } from "../features/update-task-form";

export async function loader({ params }: LoaderFunctionArgs) {
  const taskId = params.task_id!;

  try {
    const [findOneTaskByIdLoaderData] = await Promise.all([
      findOneTaskByIdLoader(queryClient, taskId),
    ]);

    return json({
      id: Math.random(),
      findOneTaskByIdLoaderData,
    });
  } catch {
    return redirect("/");
  }
}

export async function action(args: ActionFunctionArgs) {
  const result = await updateTaskAction(args, queryClient);

  if (result) {
    return result;
  }
}

export function Component() {
  const query = useFindOneTaskByIdQuery();
  const { id } = query.data.data;

  return (
    <>
      <div className="gap-6">
        <h1 className="text-3xl">Task</h1>
        <small className="text-gray-400">#{id}</small>
      </div>
      <UpdateTaskForm />
    </>
  );
}
