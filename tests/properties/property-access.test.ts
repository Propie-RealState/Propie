import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupProperty,
  cleanupTestUsers,
  registerUserViaApi,
} from "../helpers/auth-fixtures";

describe("property access by publication state", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let agent: Awaited<ReturnType<typeof registerUserViaApi>>;
  let stranger: Awaited<ReturnType<typeof registerUserViaApi>>;
  let draftPropertyId: string;
  const userIds: string[] = [];

  beforeAll(async () => {
    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    agent = await registerUserViaApi(app, "AGENT");
    stranger = await registerUserViaApi(app, "CLIENT");
    userIds.push(owner.userId, agent.userId, stranger.userId);

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
    draftPropertyId = createResponse.json().propertyId;

    await db.query(
      `
        UPDATE properties
        SET
          title = 'Draft listing',
          description = 'Not published yet'
        WHERE id = $1
      `,
      [draftPropertyId],
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
      [draftPropertyId, agent.userId, owner.userId],
    );
  });

  afterAll(async () => {
    if (draftPropertyId) {
      await db.query(
        `DELETE FROM property_assignments WHERE property_id = $1`,
        [draftPropertyId],
      );
      await cleanupProperty(draftPropertyId);
    }
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("denies anonymous access to unpublished drafts", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/properties/${draftPropertyId}`,
    });

    expect(response.statusCode).toBe(404);
  });

  it("allows owner access to unpublished drafts", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/properties/${draftPropertyId}`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().title).toBe("Draft listing");
  });

  it("allows assigned agent access to unpublished drafts", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/properties/${draftPropertyId}`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().title).toBe("Draft listing");
  });

  it("denies unauthorized users access to unpublished drafts", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/properties/${draftPropertyId}`,
      headers: { authorization: `Bearer ${stranger.accessToken}` },
    });

    expect(response.statusCode).toBe(404);
  });
});
