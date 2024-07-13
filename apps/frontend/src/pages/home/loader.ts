import { QueryClient } from "@tanstack/react-query";
import { json } from "react-router-dom";

import { findAllTaskPaginatedLoader } from "@mimir/frontend/api/task/find-all-task-paginated";

export function homeLoader(queryClient: QueryClient) {
  return async () => {
    const [findAllTaskPaginatedLoaderData] = await Promise.all([
      findAllTaskPaginatedLoader(queryClient),
    ]);
    return json({
      findAllTaskPaginatedLoaderData,
    });
  };
}
