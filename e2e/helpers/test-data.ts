import { readFileSync } from "node:fs";
import { join } from "node:path";

export type E2eSeedData = {
  password: string;
  owner: { id: string; email: string };
  client: { id: string; email: string };
  contactProperty: { id: string; title: string };
  visitConversation: { id: string };
};

const SEED_FILE = join(process.cwd(), "e2e", ".seed-output.json");

export function loadSeedData(): E2eSeedData {
  const raw = readFileSync(SEED_FILE, "utf8");
  return JSON.parse(raw) as E2eSeedData;
}

export function hasSupabaseForUploads() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
