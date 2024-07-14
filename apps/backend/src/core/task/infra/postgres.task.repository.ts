import { QueryResultRow, sql, SqlSqlToken } from "slonik";

import {
  Task,
  TaskSchema,
  taskSchema,
} from "@mimir/backend/core/task/domain/task";
import { TaskRepository } from "@mimir/backend/core/task/domain/task.repository";

import { useDatabasePool } from "@mimir/backend/lib/db";
import { Paginated, PaginatedQueryParams } from "@mimir/backend/lib/paginated";

export class PostgresTaskRepository implements TaskRepository {
  protected tableName = Task.type;
  protected schema = taskSchema;

  insert(props: Pick<TaskSchema, "description" | "user_id">): Promise<Task> {
    return useDatabasePool(async (pool) => {
      const result = await pool.query(sql.type(this.schema)`
        INSERT INTO ${sql.identifier([this.tableName])} (description, user_id)
        VALUES (${props.description}, ${props.user_id ?? null})
        RETURNING *;
      `);

      return new Task(result.rows[0]);
    });
  }

  findOneById(id: string): Promise<Task | null> {
    return useDatabasePool(async (pool) => {
      const result = await pool.query(sql.type(this.schema)`
        SELECT * from ${sql.identifier([this.tableName])} where id = ${id};
      `);

      const task = result.rows[0];

      if (!task) return null;
      return new Task(task);
    });
  }

  findAll(): Promise<Task[]> {
    return useDatabasePool(async (pool) => {
      const result = await pool.query(sql.type(this.schema)`
        SELECT * from ${sql.identifier([this.tableName])};
      `);

      return result.rows.map((row) => new Task(row));
    });
  }

  findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<Task>> {
    return useDatabasePool(async (pool) => {
      const result = await pool.query(sql.type(this.schema)`
        SELECT * from ${sql.identifier([this.tableName])} 
        LIMIT ${params["page[size]"] + 1}
        OFFSET ${params["page[size]"] * params["page[number]"]};
      `);

      return new Paginated({
        data: result.rows.map((row) => new Task(row)),
        ...params,
      });
    });
  }

  delete(id: string): Promise<void> {
    return useDatabasePool(async (pool) => {
      await pool.query(sql.type(this.schema)`
        DELETE from ${sql.identifier([this.tableName])} where id = ${id};
      `);
    });
  }

  update({
    id,
    ...params
  }: Partial<Pick<TaskSchema, "description" | "user_id">> &
    Pick<TaskSchema, "id"> & {
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

      const tasks = await pool.query(sql.type(this.schema)`
        UPDATE ${sql.identifier([this.tableName])}
        SET ${sql.join(entries, sql`, `)}
        WHERE id = ${id}
        RETURNING *;
      `);

      const task = tasks.rows[0];

      if (!task) {
        return null;
      }

      return new Task(task);
    });
  }
}
