import { z } from "zod";

import { Entity, timestamps } from "@mimir/backend/lib/entity";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  ...timestamps,
});

export type UserSchema = z.infer<typeof userSchema>;

export class User implements Entity {
  static readonly type = "users";

  constructor(private readonly props: z.infer<typeof userSchema>) {}

  toProps() {
    return this.props;
  }

  toResponse() {
    return {
      id: this.props.id,
      type: User.type,
      attributes: {
        email: this.props.email,
      },
    };
  }
}
