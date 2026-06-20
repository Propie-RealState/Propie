import { db } from "@/database/client";

import {
  commercializationModeFromType,
  manualApprovalFromType,
} from "../constants/commercialization-mode.constants";

type Input = {
  propertyId: string;
  commercializationType: "AGENTS" | "DIRECT";
};

export async function savePropertyCommercializationRepository(input: Input) {
  const result = await db.query(
    `
      INSERT INTO property_commercialization (
        property_id,
        commercialization_type,
        commercialization_mode,
        manual_approval,
        allow_chat,
        shared_calendar
      )
      VALUES ($1, $2, $3, $4, true, false)
      ON CONFLICT (property_id)
      DO UPDATE SET
        commercialization_type = EXCLUDED.commercialization_type,
        commercialization_mode = EXCLUDED.commercialization_mode,
        manual_approval = EXCLUDED.manual_approval,
        updated_at = now()
      RETURNING *
    `,
    [
      input.propertyId,
      input.commercializationType,
      commercializationModeFromType(input.commercializationType),
      manualApprovalFromType(input.commercializationType),
    ],
  );

  return result.rows[0];
}
