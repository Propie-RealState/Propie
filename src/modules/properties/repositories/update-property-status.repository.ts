import { db } from "@/database/client";

import type { PropertyLifecycleStatus } from "../constants/property-status.constants";

export async function updatePropertyStatusRepository(input: {
  propertyId: string;
  status: PropertyLifecycleStatus;
}) {
  const result = await db.query(
    `
      UPDATE properties
      SET
        status = $2,
        updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [input.propertyId, input.status],
  );

  return result.rows[0] ?? null;
}
