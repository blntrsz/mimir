import { sql } from "slonik";

import { User, userSchema } from "@mimir/backend/core/user/domain/user";
import { UserRepository } from "@mimir/backend/core/user/domain/user.repository";

import { useDatabasePool } from "@mimir/backend/lib/db";

export class PostgresUserRepository implements UserRepository {
  protected tableName = User.type;
  protected schema = userSchema;

  insert(email: string): Promise<User> {
    return useDatabasePool(async (pool) => {
      const result = await pool.query(sql.type(userSchema)`
        INSERT INTO ${sql.identifier([this.tableName])} (email)
        VALUES (${email})
        RETURNING *;
      `);

      return new User(result.rows[0]);
    });
  }

  async byEmail(email: string) {
    return useDatabasePool(async (pool) => {
      const result = await pool.query(sql.type(userSchema)`
        SELECT * from ${sql.identifier([this.tableName])} where email = ${email};
      `);

      const user = result.rows[0];

      if (!user) return null;
      return new User(user);
    });
  }

  async byId(id: string) {
    return useDatabasePool(async (pool) => {
      const result = await pool.query(sql.type(userSchema)`
        SELECT * from ${sql.identifier([this.tableName])} where id = ${id};
      `);

      const user = result.rows[0];

      if (!user) return null;
      return new User(user);
    });
  }
}
