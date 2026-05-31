import { Pool } from "pg";

const pool = new Pool({
  host: process.env.LOCAL_DB_HOST || process.env.DB_HOST || "localhost",
  port: Number(process.env.LOCAL_DB_PORT || process.env.DB_PORT || 5432),
  user: process.env.LOCAL_DB_USER || process.env.DB_USER || "propie",
  password:
    process.env.LOCAL_DB_PASSWORD || process.env.DB_PASSWORD || "propie123",
  database: process.env.LOCAL_DB_NAME || process.env.DB_NAME || "propie_db",
});

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

export { pool };
