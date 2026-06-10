import { db } from "@/database/client";

import { revokeParticipantOnAgentDeactivated } from "./sync-participants.service";

export async function deactivatePropertyAgentAssignment(input: {
  propertyId: string;
  agentId: string;
  deactivatedBy: string;
}) {
  const result = await db.query(
    `
      UPDATE property_assignments
      SET is_active = false,
          ended_at = now()
      WHERE property_id = $1
        AND agent_id = $2
        AND is_active = true
      RETURNING id
    `,
    [input.propertyId, input.agentId],
  );

  if ((result.rowCount ?? 0) === 0) {
    return false;
  }

  await revokeParticipantOnAgentDeactivated({
    propertyId: input.propertyId,
    agentId: input.agentId,
  });

  return true;
}
