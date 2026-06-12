import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupProperty,
  cleanupTestUsers,
  insertPropertyImage,
  registerUserViaApi,
} from "../helpers/auth-fixtures";

describe("property publish lifecycle", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let stranger: Awaited<ReturnType<typeof registerUserViaApi>>;
  let propertyId: string;
  const userIds: string[] = [];

  beforeAll(async () => {
    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    stranger = await registerUserViaApi(app, "CLIENT");
    userIds.push(owner.userId, stranger.userId);
  });

  afterAll(async () => {
    if (propertyId) {
      await cleanupProperty(propertyId);
    }
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("creates a draft property for the owner", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/properties",
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: {
        propertyType: "HOUSE",
        listingType: "SALE",
      },
    });

    expect(response.statusCode).toBe(201);
    propertyId = response.json().propertyId;

    const row = await db.query<{
      owner_id: string;
      published_at: string | null;
      title: string | null;
    }>(
      `SELECT owner_id, published_at, title FROM properties WHERE id = $1`,
      [propertyId],
    );

    expect(row.rows[0].owner_id).toBe(owner.userId);
    expect(row.rows[0].published_at).toBeNull();
    expect(row.rows[0].title).toBeNull();
  });

  it("persists basic, location, amenities, and commercialization", async () => {
    const basicResponse = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/basic`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: {
        title: "Casa en Cordoba",
        description: "Hermosa casa con patio amplio",
        price: 250000,
        currency: "USD",
        bedrooms: 3,
        bathrooms: 2,
        areaM2: 180,
        propertyType: "HOUSE",
        operationType: "SALE",
      },
    });

    expect(basicResponse.statusCode).toBe(200);

    const locationResponse = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/location`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: {
        country: "Argentina",
        province: "Cordoba",
        city: "Cordoba",
        neighborhood: "Centro",
        address: "San Martin 1234",
        lat: -31.4201,
        lng: -64.1888,
      },
    });

    expect(locationResponse.statusCode).toBe(200);

    const amenitiesResponse = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/amenities`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: { amenities: ["garage", "pool"] },
    });

    expect(amenitiesResponse.statusCode).toBe(200);

    const commercializationResponse = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/commercialization`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: {
        commercializationType: "AGENTS",
        manualApproval: true,
      },
    });

    expect(commercializationResponse.statusCode).toBe(200);

    const locationRow = await db.query<{ city: string }>(
      `SELECT city FROM property_locations WHERE property_id = $1`,
      [propertyId],
    );
    const amenitiesRow = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM property_amenities WHERE property_id = $1`,
      [propertyId],
    );
    const commercializationRow = await db.query<{
      commercialization_type: string;
    }>(
      `SELECT commercialization_type FROM property_commercialization WHERE property_id = $1`,
      [propertyId],
    );

    expect(locationRow.rows[0].city).toBe("Cordoba");
    expect(Number(amenitiesRow.rows[0].count)).toBe(2);
    expect(commercializationRow.rows[0].commercialization_type).toBe("AGENTS");
  });

  it("rejects updates from non-owners", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/basic`,
      headers: { authorization: `Bearer ${stranger.accessToken}` },
      payload: {
        title: "Hacked",
        description: "No access",
        price: 1,
        currency: "USD",
        bedrooms: 1,
        bathrooms: 1,
        areaM2: 50,
        propertyType: "HOUSE",
        operationType: "SALE",
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("fails publish without images", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/publish`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);

    const row = await db.query<{ published_at: string | null }>(
      `SELECT published_at FROM properties WHERE id = $1`,
      [propertyId],
    );

    expect(row.rows[0].published_at).toBeNull();
  });

  it("publishes when requirements are met", async () => {
    await insertPropertyImage(propertyId);

    const response = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/publish`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.property.status).toBe("ACTIVE");
    expect(body.property.published_at).not.toBeNull();
    expect(body.property.publisher_type).toBe("OWNER");

    const eventRow = await db.query<{ event_type: string }>(
      `
        SELECT event_type
        FROM property_events
        WHERE property_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [propertyId],
    );

    expect(eventRow.rows[0]?.event_type).toBe("PROPERTY_PUBLISHED");
  });
});
