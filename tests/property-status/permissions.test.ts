import { describe, expect, it, beforeAll } from "vitest";

import { db } from "@/database/client";
import { createTestUser } from "../helpers/test-users";
import { ensurePropertyStatusSchema } from "../helpers/ensure-property-status-schema";
import { updatePropertyStatusService } from "@/modules/properties/services/update-property-status.service";

describe("property status ownership", () => {
  beforeAll(async () => {
    await ensurePropertyStatusSchema();
  });

  it("only publisher can change status", async () => {
    const ownerId = await createTestUser("OWNER");
    const agentId = await createTestUser("AGENT");

    const property = await db.query<{ id: string }>(
      `
        INSERT INTO properties (
          owner_id,
          title,
          property_type,
          operation_type,
          status,
          publisher_id,
          publisher_type,
          published_at
        )
        VALUES ($1, $2, $3, $4, 'ACTIVE', $5, 'AGENT', now())
        RETURNING id
      `,
      [ownerId, "Publisher Test", "HOUSE", "SALE", agentId],
    );

    const propertyId = property.rows[0].id;

    await expect(
      updatePropertyStatusService({
        userId: ownerId,
        propertyId,
        status: "PAUSED",
      }),
    ).rejects.toThrow("FORBIDDEN");

    const updated = await updatePropertyStatusService({
      userId: agentId,
      propertyId,
      status: "PAUSED",
    });

    expect(updated.status).toBe("PAUSED");
  });
});
