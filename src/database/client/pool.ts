import '../../config/env';
import { Pool, type PoolConfig } from 'pg';

const deployDatabaseUrl =
  process.env.DEPLOY_DATABASE_URL ||
  process.env.DATABASE_URL;

const databaseConfig: PoolConfig = deployDatabaseUrl
  ? {
      connectionString: deployDatabaseUrl,
      ssl:
        (process.env.DEPLOY_DB_SSL || process.env.DB_SSL) === 'false'
          ? false
          : {
              rejectUnauthorized: false,
            },
    }
  : {
      host:
        process.env.LOCAL_DB_HOST ||
        process.env.DB_HOST,

      port: Number(
        process.env.LOCAL_DB_PORT ||
        process.env.DB_PORT
      ),

      database:
        process.env.LOCAL_DB_NAME ||
        process.env.DB_NAME,

      user:
        process.env.LOCAL_DB_USER ||
        process.env.DB_USER,

      password:
        process.env.LOCAL_DB_PASSWORD ||
        process.env.DB_PASSWORD,
    };

export const db = new Pool({
  ...databaseConfig,

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
