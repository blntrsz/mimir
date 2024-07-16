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

import { deleteTaskAction } from "../api/task/delete-task";
import { updateTaskAction } from "../api/task/update-task";
import { DeleteTaskForm } from "../features/delete-task-form";
import { UpdateTaskForm } from "../features/update-task-form";

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id!;

  try {
    const [findOneTaskByIdLoaderData] = await Promise.all([
      findOneTaskByIdLoader(queryClient, id),
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
  const formData = await args.request.formData();

  const updateTaskActionResult = await updateTaskAction(formData, queryClient);
  const deleteTaskActionResult = await deleteTaskAction(formData, queryClient);

  return updateTaskActionResult ?? deleteTaskActionResult;
}

export function Component() {
  const query = useFindOneTaskByIdQuery();
  const { id } = query.data.data;

  return (
    <>
      <div className="flex justify-between gap-6">
        <div className="">
          <h1 className="text-3xl">Task</h1>
          <small className="text-gray-400">#{id}</small>
        </div>
      </div>
      <div className="grid w-full gap-2">
        <UpdateTaskForm />
        <DeleteTaskForm />
      </div>
    </>
  );
}
