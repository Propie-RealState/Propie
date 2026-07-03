import '../../config/env';
import { Pool, type PoolConfig } from 'pg';

const isProduction =
  process.env.NODE_ENV === 'production';

const hasLocalDatabaseConfig =
  Boolean(
    process.env.LOCAL_DB_HOST ||
      process.env.DB_HOST
  );

const databaseUrl =
  isProduction
    ? process.env.DEPLOY_DATABASE_URL ||
      process.env.DATABASE_URL
    : hasLocalDatabaseConfig
      ? undefined
      : process.env.DATABASE_URL;

const databaseConfig: PoolConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
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

// ============================================================
// POOL SIZING (Phase 3)
// ------------------------------------------------------------
// A single Node process is single-threaded, so a very large pool
// only adds contention on Postgres (and Supabase caps total
// connections). We keep a small, explicit pool and let it be
// tuned per environment via DB_POOL_MAX.
//
//   max      : hard ceiling of concurrent connections.
//   min      : keep 0 idle by default so we release connections
//              back to Postgres/Supabase when traffic is low.
//   maxUses  : recycle a connection after N uses to bound the
//              impact of any per-connection memory growth / a
//              backend that drifts (e.g. server-side state).
//   maxLifetimeSeconds : hard cap on how long a physical
//              connection lives, so pooled clients don't outlive
//              Supabase/pgBouncer-side connection resets.
// ============================================================
const DEFAULT_POOL_MAX = 10;

const poolMax = Number(process.env.DB_POOL_MAX) || DEFAULT_POOL_MAX;

export const db = new Pool({
  ...databaseConfig,

  max: poolMax,

  min: 0,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 5000,

  maxUses: 7500,

  maxLifetimeSeconds: 1800,
});

// Never let a pool-level error crash the process (e.g. an idle
// backend dropped by the DB). pg emits these on the pool itself.
db.on('error', (error) => {
  console.error('unexpected idle database client error', error);
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
