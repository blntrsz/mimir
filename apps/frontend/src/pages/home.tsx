import { ActionFunctionArgs, json } from "react-router-dom";

import { queryClient } from "@mimir/frontend/api/queryClient";
import { createTaskAction } from "@mimir/frontend/api/task/create-task";
import { findAllTaskPaginatedLoader } from "@mimir/frontend/api/task/find-all-task-paginated";
import { CreateTaskForm } from "@mimir/frontend/features/create-task-form";
import { TaskList } from "@mimir/frontend/features/task-list";

export async function loader() {
  const [findAllTaskPaginatedLoaderData] = await Promise.all([
    findAllTaskPaginatedLoader(queryClient),
  ]);
  return json({
    id: Math.random(),
    findAllTaskPaginatedLoaderData,
  });
}

export async function action(args: ActionFunctionArgs) {
  const result = await createTaskAction(args, queryClient);

  if (result) {
    return result;
  }
}

export function Component() {
  return (
    <>
      <CreateTaskForm />
      <TaskList />
    </>
  );
}
