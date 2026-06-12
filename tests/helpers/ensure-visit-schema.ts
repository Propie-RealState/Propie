import fs from "node:fs";
import path from "node:path";

import { db } from "@/database/client";

let applied = false;

export async function ensureVisitSchema() {
  if (applied) {
    return;
  }

  const schemaPath = path.join(
    process.cwd(),
    "src/database/schemas/034-property-visits.sql",
  );

  const sql = fs.readFileSync(schemaPath, "utf8");
  await db.query(sql);
  applied = true;
}
