import '@/config/env';
import { Pool } from 'pg';


export const db = new Pool({
  host: process.env.DB_HOST,

  port: Number(
    process.env.DB_PORT
  ),

  database:
    process.env.DB_NAME,

  user: process.env.DB_USER,

  password:
    process.env.DB_PASSWORD,

  max: 20,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 5000,
});

export async function testDatabaseConnection() {
  try {
    await db.query(
      'SELECT NOW()'
    );

    console.log(
      'database connected'
    );
  } catch (error) {
    console.error(
      'database connection failed',
      error
    );

    process.exit(1);
  }
}