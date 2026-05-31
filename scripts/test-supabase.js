#!/usr/bin/env node

const { Client } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const rawUrl = process.env.DEPLOY_DATABASE_URL || process.env.DATABASE_URL;

function sanitizeConnectionString(url) {
  const stripped = url.replace(/^["']|["']$/g, '');
  const match = stripped.match(/^(postgresql|postgres):\/\/([^:]+):(.+)@([^@]+)$/);
  if (!match) return stripped;
  const [, protocol, user, password, hostPortDb] = match;
  return `${protocol}://${user}:${encodeURIComponent(password)}@${hostPortDb}`;
}

async function run() {
  console.log('\n=== TEST SUPABASE CONNECTION ===\n');

  if (!rawUrl) {
    console.error('DEPLOY_DATABASE_URL no está seteado en .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: sanitizeConnectionString(rawUrl),
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Conexion: OK\n');

    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`Tablas encontradas: ${tablesRes.rowCount}`);
    tablesRes.rows.forEach(r => console.log('  -', r.table_name));

    const extRes = await client.query(`
      SELECT extname FROM pg_extension ORDER BY extname
    `);
    console.log(`\nExtensiones activas: ${extRes.rowCount}`);
    extRes.rows.forEach(r => console.log('  -', r.extname));

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log('\n=== OK ===\n');
}

run();
