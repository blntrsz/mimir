import { useRequestContext } from "./request.context";

export class NotFound extends Response {
  constructor() {
    const requestContext = useRequestContext();

    super(
      JSON.stringify({
        errors: [
          {
            id: requestContext["x-correlation-id"],
            code: "NOT_FOUND",
            title: "Not Found",
          },
        ],
      }),
      {
        status: 404,
      },
    );
  }
}
