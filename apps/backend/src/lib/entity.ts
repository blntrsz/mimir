import { z } from "zod";

export abstract class Entity<TProps extends Record<string, unknown>> {
  protected abstract props: TProps;
  abstract toResponse(): unknown;
  abstract toEvent(): unknown;

  /**
   * Only for internal use case (e.g. loggin)
   */
  _toProps() {
    return this.props;
  }
}

export const id = {
  id: z.string().uuid(),
};

export const timestamps = {
  updated_at: z.date().optional(),
  created_at: z.date(),
};
