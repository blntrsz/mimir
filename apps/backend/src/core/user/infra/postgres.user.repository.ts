import { User, userSchema } from "@mimir/backend/core/user/domain/user";
import { UserRepository } from "@mimir/backend/core/user/domain/user.repository";

import { BaseRepository } from "@mimir/backend/lib/db";

export class PostgresUserRepository
  extends BaseRepository<typeof userSchema, User>
  implements UserRepository
{
  protected tableName = User.type;
  protected schema = userSchema;
  protected toEntity = User.toEntity;
}
