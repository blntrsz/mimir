import { QueryClient, useQuery } from "@tanstack/react-query";
import { useLoaderData, useParams } from "react-router-dom";

import { client } from "@mimir/frontend/api/http";

import { taskKeys } from "./keys";

async function findOneTaskById(id: string) {
  const response = await client.tasks[":task_id"].$get({
    param: {
      task_id: id,
    },
  });

  const body = await response.json();

  if (!response.ok || "errors" in body) {
    throw response;
  }

  return body;
}

export type FindOneTaskByIdResponse = Awaited<
  ReturnType<typeof findOneTaskById>
>;

export const findOneTaskByIdQuery = (id: string) => ({
  queryKey: taskKeys.detail(id),
  queryFn: () => findOneTaskById(id),
});

export const findOneTaskByIdLoader = async (
  queryClient: QueryClient,
  taskId: string,
) => queryClient.ensureQueryData(findOneTaskByIdQuery(taskId));

export function useFindOneTaskByIdQuery() {
  const params = useParams();
  const id = String(params.task_id);
  const { findOneTaskByIdLoaderData: initialData } = useLoaderData() as {
    findOneTaskByIdLoaderData: FindOneTaskByIdResponse;
  };

  return useQuery({
    ...findOneTaskByIdQuery(id),
    staleTime: Infinity,
    initialData,
  });
}
