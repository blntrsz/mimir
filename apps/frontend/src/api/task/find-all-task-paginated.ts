import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useLoaderData } from "react-router-dom";

import { client } from "@mimir/frontend/api/http";

import { taskKeys } from "./keys";

async function findAllTaskPaginated(url: string | null) {
  const searchParams = url ? new URLSearchParams(url) : null;
  const response = await client.tasks.$get({
    query: {
      "page[size]": "5",
      "page[number]": searchParams
        ? searchParams.get("page[number]") ?? undefined
        : undefined,
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
  initialPageParam: null,
  getNextPageParam: (lastPage: { links: { next: string | null } }) =>
    lastPage.links.next,
  queryFn: ({ pageParam = null }: { pageParam: unknown }) =>
    findAllTaskPaginated(pageParam as string | null),
});

export const findAllTaskPaginatedLoader = async (queryClient: QueryClient) =>
  queryClient.getQueryData(findAllTaskPaginatedQuery().queryKey) ??
  (await queryClient.fetchInfiniteQuery(findAllTaskPaginatedQuery()));

export function useFindAllTaskPaginatedQuery() {
  const { findAllTaskPaginatedLoaderData: initialData } = useLoaderData() as {
    findAllTaskPaginatedLoaderData: InfiniteData<FindAllTaskPaginatedResponse>;
  };

  return useInfiniteQuery({
    ...findAllTaskPaginatedQuery(),
    initialData,
    getNextPageParam: (lastPage) => lastPage.links.next,
    staleTime: Infinity,
  });
}
