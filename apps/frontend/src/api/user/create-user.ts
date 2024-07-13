import { QueryClient } from "@tanstack/react-query";

import { client } from "@mimir/frontend/api/http";

import { userKeys } from "./keys";

export async function createUserAction(
  attributes: { email: string },
  queryClient: QueryClient,
) {
  const result = await client.users.$post({
    json: attributes,
  });

  queryClient.invalidateQueries({
    queryKey: userKeys.lists(),
  });

  return result;
}
