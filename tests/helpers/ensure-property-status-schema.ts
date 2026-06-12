import fs from "node:fs";
import path from "node:path";

import { db } from "@/database/client";

let applied = false;

async function applySchema(fileName: string) {
  const schemaPath = path.join(
    process.cwd(),
    `src/database/schemas/${fileName}`,
  );
  const sql = fs.readFileSync(schemaPath, "utf8");
  await db.query(sql);
}

export async function ensurePropertyStatusSchema() {
  if (applied) {
    return;
  }

  await applySchema("035-property-publisher-status.sql");
  await applySchema("036-property-events.sql");
  await applySchema("037-property-status-subscriptions.sql");
  applied = true;
}
