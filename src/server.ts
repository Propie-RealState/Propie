import { buildApp } from './app';

import '@/config/env';

import {
  testDatabaseConnection,
} from '@/database/client';



// ========================================================
// START SERVER
// ========================================================

async function startServer() {
  try {
    await testDatabaseConnection();

    const app =
      await buildApp();

    const PORT =
      Number(
        process.env.PORT
      ) || 3000;

    await app.listen({
      port: PORT,

      host: '0.0.0.0',
    });

    console.log(
      `server running on port ${PORT}`
    );
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

startServer();