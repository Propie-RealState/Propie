import fs from "node:fs";
import path from "node:path";

import { db } from "@/database/client";

let applied = false;

export async function ensureCommercializationModeSchema() {
  if (applied) {
    return;
  }

  const schemaPath = path.join(
    process.cwd(),
    "src/database/schemas/038-property-commercialization-mode.sql",
  );
  const sql = fs.readFileSync(schemaPath, "utf8");
  await db.query(sql);
  applied = true;
}

export async function setPropertyCommercializationMode(
  propertyId: string,
  mode: "WITH_AGENTS" | "WITHOUT_INTERMEDIARIES",
) {
  await db.query(
    `
      INSERT INTO property_commercialization (
        property_id,
        commercialization_type,
        commercialization_mode,
        manual_approval,
        allow_chat,
        shared_calendar
      )
      VALUES ($1, 'AGENTS', $2, false, true, false)
      ON CONFLICT (property_id)
      DO UPDATE SET
        commercialization_mode = EXCLUDED.commercialization_mode,
        updated_at = now()
    `,
    [propertyId, mode],
  );
}
