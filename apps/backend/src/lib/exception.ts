import { z } from "@hono/zod-openapi";

import { useRequestContext } from "./request.context";

export type Ok<T> = [T, undefined];
export type Err<T> = [undefined, T];

export abstract class Exception extends Error {
  abstract readonly code: string;
  abstract readonly message: string;

  toDoc(description: string) {
    return {
      content: {
        "application/json": {
          schema: z.object({
            errors: z.array(
              z.object({
                id: z.string().uuid(),
                code: z.literal(this.code),
                title: z.literal(this.message),
              }),
            ),
          }),
        },
      },
      description,
    } as const;
  }

  toResponse() {
    return {
      errors: [
        {
          id: useRequestContext().requestId,
          code: this.code,
          title: this.message,
        },
      ],
    } as const;
  }
}

export class BadRequestException extends Exception {
  code = "BAD_REQUEST";
  message = "Bad request";
}

export class AlreadyExistsException extends Exception {
  code = "ALREADY_EXISTS";
  message: string;

  constructor(entityName: string) {
    super();
    this.message = `${entityName} already exists`;
  }
}

export class NotFoundException extends Exception {
  code = "NOT_FOUND";
  message: string;

  constructor(entityName: string) {
    super();
    this.message = `${entityName} not found`;
  }
}

export class InternalServerException extends Exception {
  code = "INTERNAL_SERVER_ERROR";
  message = "Internal Server Error";
}
