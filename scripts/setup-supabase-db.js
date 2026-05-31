#!/usr/bin/env node

/**
 * Runs all SQL schemas from src/database/schemas against the Supabase database.
 * Uses DEPLOY_DATABASE_URL from .env. Does not require psql installed locally.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SCHEMA_DIR = path.join(__dirname, '..', 'src', 'database', 'schemas');
const SKIP_FILES = ['000-create-app-user.sql'];

const rawUrl = process.env.DEPLOY_DATABASE_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  console.error('\nMissing DEPLOY_DATABASE_URL in .env\n');
  process.exit(1);
}

/**
 * PostgreSQL connection strings can have special chars in the password (@, #, $, etc.)
 * that break URL parsing. This function extracts credentials via regex and rebuilds
 * the URL with the password properly percent-encoded.
 */
function sanitizeConnectionString(url) {
  // Strip surrounding quotes if dotenv left them
  const stripped = url.replace(/^["']|["']$/g, '');

  // Match: protocol://user:password@host:port/db
  // Use a greedy match for password that allows @ signs, stopping at the last @
  const match = stripped.match(/^(postgresql|postgres):\/\/([^:]+):(.+)@([^@]+)$/);

  if (!match) {
    return stripped;
  }

  const [, protocol, user, password, hostPortDb] = match;
  const encodedPassword = encodeURIComponent(password);

  return `${protocol}://${user}:${encodedPassword}@${hostPortDb}`;
}

const connectionString = sanitizeConnectionString(rawUrl);

async function run() {
  console.log('');
  console.log('===================================');
  console.log('      PROPIE SUPABASE DB SETUP');
  console.log('===================================');
  console.log('');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to Supabase\n');

  const files = fs
    .readdirSync(SCHEMA_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (SKIP_FILES.includes(file)) {
      console.log(`Skipping: ${file} (local Docker-only role script)`);
      console.log('');
      continue;
    }

    const filePath = path.join(SCHEMA_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`Executing: ${file}`);

    try {
      await client.query(sql);
      console.log(`Done: ${file}`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`Skipped (already exists): ${file}`);
      } else {
        console.error(`Error in ${file}:`, err.message);
        await client.end();
        process.exit(1);
      }
    }

    console.log('');
  }

  await client.end();

  console.log('===================================');
  console.log('       SUPABASE DATABASE READY');
  console.log('===================================');
  console.log('');
}

run().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
