import { Context } from "./context";

const RequestContext = Context.create<{
  awsRequestId: string;
  ["x-correlation-id"]: string;
  ["x-correlation-trace-id"]: string;
}>("RequestContext");

export const withRequestContext = RequestContext.with;
export const useRequestContext = RequestContext.use;
