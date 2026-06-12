import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

export function createE2ePool() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return new Pool({
      connectionString: databaseUrl,
      ssl:
        process.env.DB_SSL === "false"
          ? false
          : { rejectUnauthorized: false },
    });
  }

  return new Pool({
    host: process.env.LOCAL_DB_HOST ?? process.env.DB_HOST ?? "localhost",
    port: Number(process.env.LOCAL_DB_PORT ?? process.env.DB_PORT ?? 5432),
    database: process.env.LOCAL_DB_NAME ?? process.env.DB_NAME ?? "propie_db",
    user: process.env.LOCAL_DB_USER ?? process.env.DB_USER ?? "propie",
    password:
      process.env.LOCAL_DB_PASSWORD ?? process.env.DB_PASSWORD ?? "propie123",
  });
}
