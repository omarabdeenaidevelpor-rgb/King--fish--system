import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

export const hasDatabaseConfig = Boolean(
  process.env.DATABASE_URL ||
  (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME)
);

// Development/preview can run the admin shell without a provisioned database.
// Production remains database-backed unless DEMO_MODE is explicitly enabled.
// Demo mode must be explicitly enabled. Development should use the configured
// database so missing migrations or seed data are reported instead of hidden.
export const isDemoMode = process.env.DEMO_MODE === 'true';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL;
    const poolConfig = connectionString
      ? { connectionString }
      : {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER || process.env.SQL_ADMIN_USER,
        password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD,
        database: process.env.SQL_DB_NAME,
      };

    global._postgresPool = new Pool({
      ...poolConfig,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
