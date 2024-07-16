import { z } from "zod";

import { Entity, id, timestamps } from "@mimir/backend/lib/entity";

export const userSchema = z.object({
  ...id,
  email: z.string().email(),
  ...timestamps,
});

export type UserSchema = z.infer<typeof userSchema>;

export class User extends Entity<UserSchema> {
  static readonly type = "users";

  constructor(readonly props: z.infer<typeof userSchema>) {
    super();
  }

  static toEntity(props: UserSchema) {
    return new User(props);
  }

  toEvent() {
    return {
      id: this.props.id,
      email: this.props.email,
    };
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
