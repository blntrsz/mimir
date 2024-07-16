import {
  createPool as createSlonikPool,
  DatabasePool,
  DatabaseTransactionConnection,
  QueryResultRow,
  sql,
  SqlSqlToken,
} from "slonik";
import { z, ZodTypeAny } from "zod";

import { Context } from "./context";
import { Entity } from "./entity";
import { Paginated, PaginatedQueryParams } from "./paginated";

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

const baseType = z.object({
  id: z.string(),
});

export abstract class BaseRepository<
  TSchema extends typeof baseType,
  TEntity extends Entity<any>,
> {
  protected abstract tableName: string;
  protected abstract schema: TSchema;
  protected abstract toEntity: (props: z.infer<typeof this.schema>) => TEntity;

  async insert(entity: Partial<z.infer<typeof this.schema>>): Promise<TEntity> {
    return useDatabasePool(async (pool) => {
      const keys = Object.keys(entity).map((key) => sql.identifier([key]));
      const values = Object.values(entity);

      console.log({ keys, values });

      const schemaType = this.schema as ZodTypeAny;

      const result = await pool.query(sql.type(schemaType)`
        INSERT INTO ${sql.identifier([this.tableName])} (${sql.join(keys, sql`, `)})
        VALUES (${sql.join(values, sql`, `)})
        RETURNING *;
      `);

      return this.toEntity(result.rows[0]);
    });
  }

  async findOneById(id: string): Promise<TEntity | null> {
    return useDatabasePool(async (pool) => {
      const schemaType = this.schema as ZodTypeAny;

      const result = await pool.query(sql.type(schemaType)`
        SELECT * from ${sql.identifier([this.tableName])} where id = ${id};
      `);

      const item = result.rows[0];

      if (!item) return null;
      return this.toEntity(item);
    });
  }

  findAll(): Promise<TEntity[]> {
    return useDatabasePool(async (pool) => {
      const schemaType = this.schema as ZodTypeAny;

      const result = await pool.query(sql.type(schemaType)`
        SELECT * from ${sql.identifier([this.tableName])};
      `);

      return result.rows.map((row) => this.toEntity(row));
    });
  }

  findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<TEntity>> {
    return useDatabasePool(async (pool) => {
      const schemaType = this.schema as ZodTypeAny;

      const result = await pool.query(sql.type(schemaType)`
        SELECT * from ${sql.identifier([this.tableName])} 
        LIMIT ${params["page[size]"] + 1}
        OFFSET ${params["page[size]"] * params["page[number]"]};
      `);

      return new Paginated({
        data: result.rows.map((row) => this.toEntity(row)),
        ...params,
      });
    });
  }

  delete(id: string): Promise<void> {
    return useDatabasePool(async (pool) => {
      const schemaType = this.schema as ZodTypeAny;

      await pool.query(sql.type(schemaType)`
        DELETE from ${sql.identifier([this.tableName])} where id = ${id};
      `);
    });
  }

  update({
    id,
    ...params
  }: Partial<z.infer<TSchema>> &
    Pick<z.infer<TSchema>, "id"> & {
      done_at?: boolean;
    }) {
    return useDatabasePool(async (pool) => {
      const entries = Object.entries(params)
        .map(([key, value]) => {
          if (typeof value === "boolean") {
            return value
              ? sql`${sql.identifier([key])} = NOW()`
              : sql`${sql.identifier([key])} = NULL`;
          }

          return value ? sql`${sql.identifier([key])} = ${value}` : undefined;
        })
        .filter(Boolean) as SqlSqlToken<QueryResultRow>[];
      entries.push(sql`updated_at = NOW()`);
      const schemaType = this.schema as ZodTypeAny;

      const tasks = await pool.query(sql.type(schemaType)`
        UPDATE ${sql.identifier([this.tableName])}
        SET ${sql.join(entries, sql`, `)}
        WHERE id = ${id}
        RETURNING *;
      `);

      const item = tasks.rows[0];

      return this.toEntity(item);
    });
  }
}
