import { SearchParams } from "@frontend/routes";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { useLoaderData, useSearchParams } from "react-router-dom";

import { client } from "@mimir/frontend/api/http";

import { taskKeys } from "./keys";

async function findAllTaskPaginated() {
  const response = await client.tasks.$get();

  const body = await response.json();

  return body;
}

export type FindAllTaskPaginatedResponse = Awaited<
  ReturnType<typeof findAllTaskPaginated>
>;

export const findAllTaskPaginatedQuery = () => ({
  queryKey: taskKeys.lists(),
  queryFn: () => listTasks(userId),
});

export const findAllTaskPaginatedLoader = (
  queryClient: QueryClient,
  userId?: number,
) => queryClient.ensureQueryData(listTasksQuery(userId));

export function useFindAllTaskPaginatedQuery() {
  const [searchParams] = useSearchParams();
  const { listTasksLoaderData: initialData } = useLoaderData() as {
    listTasksLoaderData: Awaited<ReturnType<typeof listTasks>>;
  };

  return useQuery({
    ...findAllTaskPaginatedQuery(),
    staleTime: Infinity,
    initialData,
  });
}
