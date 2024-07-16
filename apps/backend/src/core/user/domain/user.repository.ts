import { BaseRepository } from "@mimir/backend/lib/db";

import { User, userSchema } from "./user";

export interface UserRepository
  extends BaseRepository<typeof userSchema, User> {}
