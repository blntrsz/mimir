import { z } from "zod";

export enum QueryParamsEnum {
  PAGE_NUMBER = "page[number]",
  PAGE_SIZE = "page[size]",
}

export const queryParams = z.object({
  [QueryParamsEnum.PAGE_NUMBER]: z.coerce
    .number()
    .min(0)
    .optional()
    .default(0)
    .openapi({
      description: "The page number.",
    }),
  [QueryParamsEnum.PAGE_SIZE]: z.coerce
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .openapi({
      description: "The page size, how many entities to return in a page.",
    }),
});
export type QueryParams = z.infer<typeof queryParams>;
