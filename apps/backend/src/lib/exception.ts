import { useRequestContext } from "./request.context";

export abstract class Exception extends Error {
  abstract code: string;
  abstract message: string;
  abstract status?: number;

  toResponse() {
    return new Response(
      JSON.stringify({
        errors: [
          {
            id: useRequestContext().awsRequestId,
            code: this.code,
            title: this.message,
          },
        ],
      }),
      {
        status: this.status,
      },
    );
  }
}

export class BadRequestException extends Exception {
  code = "BAD_REQUEST";
  status = 400;
  message = "Bad request";
}

export class AlreadyExistsException extends Exception {
  code = "ALREADY_EXISTS";
  status = 409;
  message: string;

  constructor(entityName: string) {
    super();
    this.message = `${entityName} already exists`;
  }
}

export class NotFoundException extends Exception {
  code = "NOT_FOUND";
  status = 404;
  message: string;

  constructor(entityName: string) {
    super();
    this.message = `${entityName} not found`;
  }
}
