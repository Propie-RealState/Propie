import { db } from "@/database/client";

import {
  DEFAULT_COMMERCIALIZATION_MODE,
  type PropertyCommercializationMode,
} from "../constants/commercialization-mode.constants";

export async function getPropertyCommercializationModeRepository(
  propertyId: string,
): Promise<PropertyCommercializationMode> {
  const result = await db.query<{ commercialization_mode: string }>(
    `
      SELECT commercialization_mode
      FROM property_commercialization
      WHERE property_id = $1
      LIMIT 1
    `,
    [propertyId],
  );

  const mode = result.rows[0]?.commercialization_mode;

  if (mode === "WITHOUT_INTERMEDIARIES") {
    return "WITHOUT_INTERMEDIARIES";
  }

  return DEFAULT_COMMERCIALIZATION_MODE;
}
