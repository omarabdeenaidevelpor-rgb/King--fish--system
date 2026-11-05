import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const dbCredentials = process.env.DATABASE_URL
  ? { url: process.env.DATABASE_URL }
  : {
      host: process.env.SQL_HOST || 'localhost',
      user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres',
      password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || '',
      database: process.env.SQL_DB_NAME || 'kingfish',
      ssl: false,
    };

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials,
  verbose: true,
});
