export const userKeys = {
  all: ["users"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: any) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
};
