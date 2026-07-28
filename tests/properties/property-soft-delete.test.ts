import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupProperty,
  cleanupTestUsers,
  registerUserViaApi,
} from "../helpers/auth-fixtures";
import { ensurePropertySoftDeleteSchema } from "../helpers/ensure-property-soft-delete-schema";

describe("property owner soft delete", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let otherOwner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let agent: Awaited<ReturnType<typeof registerUserViaApi>>;
  let propertyId: string;
  const userIds: string[] = [];

  beforeAll(async () => {
    await ensurePropertySoftDeleteSchema();
    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    otherOwner = await registerUserViaApi(app, "OWNER");
    agent = await registerUserViaApi(app, "AGENT");
    userIds.push(owner.userId, otherOwner.userId, agent.userId);

    const createResponse = await app.inject({
      method: "POST",
      url: "/properties",
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: {
        propertyType: "HOUSE",
        listingType: "SALE",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    propertyId = createResponse.json().propertyId;

    await db.query(
      `
        UPDATE properties
        SET
          title = 'Soft delete listing',
          description = 'Owned listing',
          price = 100000,
          published_at = now(),
          publisher_id = $2,
          publisher_type = 'OWNER',
          status = 'ACTIVE'
        WHERE id = $1
      `,
      [propertyId, owner.userId],
    );

    await db.query(
      `
        INSERT INTO property_assignments (
          property_id,
          agent_id,
          assigned_by,
          is_active
        )
        VALUES ($1, $2, $3, true)
      `,
      [propertyId, agent.userId, owner.userId],
    );
  });

  afterAll(async () => {
    if (propertyId) {
      await db.query(
        `DELETE FROM property_assignments WHERE property_id = $1`,
        [propertyId],
      );
      await cleanupProperty(propertyId);
    }
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("rejects anonymous delete with 401", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/properties/${propertyId}`,
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects assigned agent with 403", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/properties/${propertyId}`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().message).toMatch(/owner/i);
  });

  it("rejects different owner with 403", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/properties/${propertyId}`,
      headers: { authorization: `Bearer ${otherOwner.accessToken}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it("returns 404 for missing property", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/properties/00000000-0000-4000-8000-000000000099`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(response.statusCode).toBe(404);
  });

  it("allows owner soft delete and hides from listings", async () => {
    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/properties/${propertyId}`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(deleteResponse.statusCode).toBe(204);

    const row = await db.query(
      `SELECT deleted_at, deleted_by FROM properties WHERE id = $1`,
      [propertyId],
    );
    expect(row.rows[0].deleted_at).not.toBeNull();
    expect(row.rows[0].deleted_by).toBe(owner.userId);

    const detail = await app.inject({
      method: "GET",
      url: `/properties/${propertyId}`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });
    expect(detail.statusCode).toBe(404);

    const mine = await app.inject({
      method: "GET",
      url: "/properties/mine",
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });
    expect(mine.statusCode).toBe(200);
    const list = mine.json() as Array<{ id: string }>;
    expect(list.map((p) => p.id)).not.toContain(propertyId);

    const mutation = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/status`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: { status: "PAUSED" },
    });
    expect([403, 404]).toContain(mutation.statusCode);
  });

  it("returns 204 on idempotent second delete by owner", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/properties/${propertyId}`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(response.statusCode).toBe(204);
  });
});
