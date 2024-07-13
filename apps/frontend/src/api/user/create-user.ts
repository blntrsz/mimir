import type { UserSchema } from "@backend/core/user/domain/user";
import { client } from "@frontend/api/http";
import { QueryClient } from "@tanstack/react-query";

import { userKeys } from "./keys";

export async function createUserAction(
  attributes: Pick<UserSchema, "email">,
  queryClient: QueryClient,
) {
  queryClient.setQueryData<ListUsersResponse>(
    userKeys.list(undefined),
    (old) => {
      return {
        ...old,
        data: [
          ...old.data,
          {
            id: old.data.at(-1).id + 1,
            type: "users",
            isCreating: true,
            attributes,
          },
        ],
      };
    },
  );
  const result = await client.users.$post({
    json: {
      userId: attributes.userId,
      description: attributes.description,
    },
  });

  queryClient.invalidateQueries({ queryKey: userKeys.lists() });

  return result;
}
