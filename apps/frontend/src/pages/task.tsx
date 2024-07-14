import { json, LoaderFunctionArgs, redirect } from "react-router-dom";

import { queryClient } from "@mimir/frontend/api/queryClient";
import {
  findOneTaskByIdLoader,
  useFindOneTaskByIdQuery,
} from "@mimir/frontend/api/task/find-one-task-by-id";

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

export function Component() {
  const query = useFindOneTaskByIdQuery();
  return <>{query.data.data.attributes.description}</>;
}
