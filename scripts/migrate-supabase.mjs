#!/usr/bin/env node
/**
 * migrate-supabase.mjs
 * Runs all SQL migration files against Supabase.
 *
 * Usage:
 *   node scripts/migrate-supabase.mjs            # run all files
 *   node scripts/migrate-supabase.mjs 023        # run files >= 023
 *   node scripts/migrate-supabase.mjs --dry-run  # list without running
 */

import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const require = createRequire(import.meta.url);

// ── Load .env manually (no dotenv needed) ────────────────────────────────────
function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../.env");
    const lines = readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // no .env — use process.env as-is
  }
}

loadEnv();

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const fromFilter = args.find((a) => /^\d+$/.test(a)) ?? null;

// ── Colors ────────────────────────────────────────────────────────────────────
const c = {
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

console.log("");
console.log(c.cyan("==================================="));
console.log(c.cyan("   PROPIE — SUPABASE MIGRATION"));
console.log(c.cyan("==================================="));
console.log("");

// ── Validate connection string ────────────────────────────────────────────────
const connectionString = process.env.DEPLOY_DATABASE_URL;

if (!connectionString) {
  console.error(c.red("❌  DEPLOY_DATABASE_URL not set in .env"));
  process.exit(1);
}

// ── Collect SQL files ─────────────────────────────────────────────────────────
const schemasDir = resolve(__dirname, "../src/database/schemas");

// 000-create-app-user.sql uses psql meta-commands (\if, \warn) and
// CREATE USER which are not supported in Supabase managed Postgres.
const SUPABASE_SKIP = new Set(["000-create-app-user.sql"]);

let files = readdirSync(schemasDir)
  .filter((f) => f.endsWith(".sql") && !SUPABASE_SKIP.has(f))
  .sort();

if (fromFilter) {
  files = files.filter((f) => f >= fromFilter);
  console.log(c.yellow(`  Filtering files >= ${fromFilter}`));
}

console.log(`  Target:  ${c.cyan("Supabase")}`);
console.log(`  Files:   ${c.cyan(String(files.length))}`);

if (dryRun) {
  console.log(`  Mode:    ${c.yellow("DRY RUN (no changes)")}`);
}

console.log("");

// ── Run ───────────────────────────────────────────────────────────────────────
const { Pool } = require("pg");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

let success = 0;
let failed = 0;

for (const filename of files) {
  const label = filename.padEnd(52);
  process.stdout.write(`  ${label}`);

  if (dryRun) {
    console.log(c.yellow("(skip)"));
    success++;
    continue;
  }

  const sql = readFileSync(join(schemasDir, filename), "utf8");

  try {
    await pool.query(sql);
    console.log(c.green("✓"));
    success++;
  } catch (err) {
    const msg = err.message.split("\n")[0];
    const isAlreadyExists =
      msg.includes("already exists") ||
      msg.includes("duplicate key") ||
      err.code === "42P07" || // relation already exists
      err.code === "42701" || // column already exists
      err.code === "42710";   // duplicate object

    if (isAlreadyExists) {
      console.log(c.yellow("~ ya existe"));
      success++;
    } else {
      console.log(c.red("✗ FAILED"));
      console.log(c.red(`    ${msg}`));
      failed++;
    }
  }
}

await pool.end();

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("");
console.log(c.cyan("==================================="));

if (failed === 0) {
  console.log(c.green(`  ✓ ${success} archivos aplicados correctamente`));
} else {
  console.log(`  ${c.green(`✓ ${success} ok`)}  ${c.red(`✗ ${failed} fallidos`)}`);
}

console.log(c.cyan("==================================="));
console.log("");
