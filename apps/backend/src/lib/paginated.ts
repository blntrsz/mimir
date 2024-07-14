import { z } from "zod";

import { Entity } from "./entity";
import { queryParams, QueryParamsEnum } from "./query-params";

export const paginatedQueryParamsSchema = queryParams.pick({
  [QueryParamsEnum.PAGE_SIZE]: true,
  [QueryParamsEnum.PAGE_NUMBER]: true,
});

export type PaginatedQueryParams = z.infer<typeof paginatedQueryParamsSchema>;

export class Paginated<T extends Entity<Record<string, unknown>>> {
  readonly [QueryParamsEnum.PAGE_SIZE]: number;
  readonly [QueryParamsEnum.PAGE_NUMBER]: number;
  readonly data: readonly T[];

  constructor(props: Omit<Paginated<T>, "toJsonAPI">) {
    this.data = props.data;
    this[QueryParamsEnum.PAGE_SIZE] = props[QueryParamsEnum.PAGE_SIZE];
    this[QueryParamsEnum.PAGE_NUMBER] = props[QueryParamsEnum.PAGE_NUMBER];
  }

  toJsonAPI(request: Request) {
    const prev = new URL(request.url);
    prev.searchParams.set(
      QueryParamsEnum.PAGE_NUMBER,
      (this[QueryParamsEnum.PAGE_NUMBER] - 1).toString(),
    );
    const next = new URL(request.url);
    next.searchParams.set(
      QueryParamsEnum.PAGE_NUMBER,
      (this[QueryParamsEnum.PAGE_NUMBER] + 1).toString(),
    );

    return {
      data: this.data
        .map((d) => d.toResponse())
        .splice(0, this[QueryParamsEnum.PAGE_SIZE]),
      links: {
        prev: this[QueryParamsEnum.PAGE_NUMBER] ? prev.toString() : null,
        next:
          this[QueryParamsEnum.PAGE_SIZE] < this.data.length
            ? next.toString()
            : null,
      },
    };
  }
}
