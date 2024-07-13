import {
  createPool as createSlonikPool,
  DatabasePool,
  DatabaseTransactionConnection,
} from "slonik";
import { z } from "zod";

import { Context } from "./context";

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
