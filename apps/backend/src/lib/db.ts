import {
  createPool as createSlonikPool,
  DatabasePool,
  DatabaseTransactionConnection,
  sql,
} from "slonik";
import { z, ZodTypeAny } from "zod";

import { Context } from "./context";
import { Entity } from "./entity";

const POSTGRES_CONNECTION_URI = z
  .string()
  .parse(process.env.POSTGRES_CONNECTION_URI);

const DatabasePoolContext = Context.create<{
  pool: DatabasePool | DatabaseTransactionConnection;
}>("DatabasePoolContext");

async function createPool() {
  const pool = await createSlonikPool(POSTGRES_CONNECTION_URI, {
    maximumPoolSize: 1,
  });

  return pool;
}

export async function useDatabasePool<T>(
  callback: (pool: DatabasePool | DatabaseTransactionConnection) => Promise<T>,
) {
  try {
    const { pool } = DatabasePoolContext.use();
    return await callback(pool);
  } catch (error) {
    const pool = await createPool();
    return await callback(pool);
  }
}

export async function createTransaction<T>(
  callback: (pool: DatabasePool | DatabaseTransactionConnection) => Promise<T>,
) {
  try {
    const { pool } = DatabasePoolContext.use();
    return callback(pool);
  } catch (error) {
    const pool = await createPool();
    return pool.transaction(async (tx) => {
      const result = await DatabasePoolContext.with({ pool: tx }, async () => {
        return callback(pool);
      });
      return result;
    });
  }
}

export abstract class BaseRepository<
  TSchema extends ZodTypeAny,
  TEntity extends Entity<any>,
> {
  protected abstract tableName: string;
  protected abstract schema: TSchema;
  protected abstract toEntity: (props: z.infer<typeof this.schema>) => TEntity;

  async insert(entity: Partial<z.infer<typeof this.schema>>): Promise<TEntity> {
    return useDatabasePool(async (pool) => {
      const keys = Object.keys(entity);
      const values = Object.values(entity);

      const schemaType = this.schema as ZodTypeAny;

      const result = await pool.query(sql.type(schemaType)`
        INSERT INTO ${sql.identifier([this.tableName])} (${sql.join(keys, sql`, `)})
        VALUES (${sql.join(values, sql`, `)})
        RETURNING *;
      `);

      return this.toEntity(result.rows[0]);
    });
  }
}
