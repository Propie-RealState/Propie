import dotenv from 'dotenv';

dotenv.config();

const isProduction =
  process.env.NODE_ENV === 'production';

function setDefaultEnv(
  key: string,
  value: string | undefined
) {
  if (
    process.env[key] == null &&
    value != null &&
    value.length > 0
  ) {
    process.env[key] = value;
  }
}

if (isProduction) {
  setDefaultEnv(
    'DATABASE_URL',
    process.env.DEPLOY_DATABASE_URL
  );

  setDefaultEnv(
    'DB_SSL',
    process.env.DEPLOY_DB_SSL
  );

  setDefaultEnv(
    'FRONTEND_ORIGIN',
    process.env.DEPLOY_FRONTEND_ORIGIN
  );

  setDefaultEnv(
    'JWT_SECRET',
    process.env.DEPLOY_JWT_SECRET
  );

  setDefaultEnv(
    'JWT_REFRESH_SECRET',
    process.env.DEPLOY_JWT_REFRESH_SECRET
  );

  setDefaultEnv(
    'CRON_SECRET',
    process.env.DEPLOY_CRON_SECRET
  );
} else {
  setDefaultEnv(
    'DB_HOST',
    process.env.LOCAL_DB_HOST
  );

  setDefaultEnv(
    'DB_PORT',
    process.env.LOCAL_DB_PORT
  );

  setDefaultEnv(
    'DB_NAME',
    process.env.LOCAL_DB_NAME
  );

  setDefaultEnv(
    'DB_USER',
    process.env.LOCAL_DB_USER
  );

  setDefaultEnv(
    'DB_PASSWORD',
    process.env.LOCAL_DB_PASSWORD
  );

  setDefaultEnv(
    'JWT_SECRET',
    process.env.LOCAL_JWT_SECRET ||
      'local_dev_jwt_secret'
  );

  setDefaultEnv(
    'JWT_REFRESH_SECRET',
    process.env.LOCAL_JWT_REFRESH_SECRET ||
      'local_dev_jwt_refresh_secret'
  );

  setDefaultEnv(
    'CRON_SECRET',
    process.env.LOCAL_CRON_SECRET ||
      'local_dev_cron_secret'
  );
}
