import { z } from "zod";

export const paginatedQueryParamsSchema = z.object({
  limit: z.coerce.number().min(10).max(100),
  page: z.coerce.number().min(1).default(1),
  offset: z.coerce.number().default(0),
  field: z.string().or(z.boolean()).default("id"),
  order: z.enum(["asc", "desc"]).default("asc"),
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
