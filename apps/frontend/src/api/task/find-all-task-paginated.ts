import { QueryClient, useQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router-dom";

import { client } from "@mimir/frontend/api/http";

import { taskKeys } from "./keys";

async function findAllTaskPaginated() {
  const response = await client.tasks.$get({
    query: {
      limit: "25",
    },
  });

  const body = await response.json();

  return body;
}

export type FindAllTaskPaginatedResponse = Awaited<
  ReturnType<typeof findAllTaskPaginated>
>;

export const findAllTaskPaginatedQuery = () => ({
  queryKey: taskKeys.lists(),
  queryFn: () => findAllTaskPaginated(),
});

export const findAllTaskPaginatedLoader = (queryClient: QueryClient) =>
  queryClient.ensureQueryData(findAllTaskPaginatedQuery());

export function useFindAllTaskPaginatedQuery() {
  const { findAllTaskPaginatedLoaderData: initialData } = useLoaderData() as {
    findAllTaskPaginatedLoaderData: FindAllTaskPaginatedResponse;
  };

  return useQuery({
    ...findAllTaskPaginatedQuery(),
    staleTime: Infinity,
    initialData,
  });
}
