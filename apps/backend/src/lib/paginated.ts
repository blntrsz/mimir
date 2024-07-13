import { z } from "zod";

export const paginatedQueryParamsSchema = z.object({
  limit: z.number().min(10),
  page: z.number().min(1).default(1),
  offset: z.number().default(0),
  orderBy: z.object({
    field: z.string().or(z.boolean()),
    param: z.enum(["asc", "desc"]),
  }),
});

export type PaginatedQueryParams = z.infer<typeof paginatedQueryParamsSchema>;

export class Paginated<T> {
  readonly count: number;
  readonly limit: number;
  readonly page: number;
  readonly data: readonly T[];

  constructor(props: Paginated<T>) {
    this.count = props.count;
    this.limit = props.limit;
    this.page = props.page;
    this.data = props.data;
  }
}
