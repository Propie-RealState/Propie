import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupProperty,
  cleanupTestUsers,
  registerUserViaApi,
} from "../helpers/auth-fixtures";
import { generateMediaToken } from "@/services/auth/jwt";

describe("media capability tokens", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let stranger: Awaited<ReturnType<typeof registerUserViaApi>>;
  let propertyId: string;
  let storagePath: string;
  const userIds: string[] = [];

  beforeAll(async () => {
    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    stranger = await registerUserViaApi(app, "CLIENT");
    userIds.push(owner.userId, stranger.userId);

    const created = await app.inject({
      method: "POST",
      url: "/properties",
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: {
        propertyType: "HOUSE",
        listingType: "SALE",
      },
    });

    propertyId = created.json().propertyId;
    storagePath = `images/${propertyId}/capability-test.webp`;

    await db.query(
      `
        INSERT INTO property_images (
          property_id,
          image_url,
          is_cover
        )
        VALUES ($1, $2, true)
      `,
      [propertyId, storagePath],
    );
  });

  afterAll(async () => {
    if (propertyId) {
      await cleanupProperty(propertyId);
    }
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("GET /media/token requires authentication", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/media/token",
    });

    expect(response.statusCode).toBe(401);
  });

  it("GET /media/token returns a capability token for authenticated users", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/media/token",
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(20);
  });

  it("denies anonymous access to draft property media", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/media/${storagePath}`,
    });

    expect(response.statusCode).toBe(403);
  });

  it("allows owner draft media via capability token (?ct=)", async () => {
    const mediaToken = generateMediaToken({
      userId: owner.userId,
      role: "OWNER",
    });

    const response = await app.inject({
      method: "GET",
      url: `/media/${storagePath}?ct=${mediaToken}`,
    });

    expect(response.statusCode).not.toBe(403);
  });

  it("denies non-owner draft media even with a capability token", async () => {
    const mediaToken = generateMediaToken({
      userId: stranger.userId,
      role: "CLIENT",
    });

    const response = await app.inject({
      method: "GET",
      url: `/media/${storagePath}?ct=${mediaToken}`,
    });

    expect(response.statusCode).toBe(403);
  });

  it("allows owner draft media via Authorization header", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/media/${storagePath}`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(response.statusCode).not.toBe(403);
  });

  it("sends Referrer-Policy: no-referrer on media responses", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/media/${storagePath}`,
    });

    expect(response.headers["referrer-policy"]).toBe("no-referrer");
  });

  it("caps redirect max-age within the signed URL lifetime", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/media/${storagePath}`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    if (response.statusCode === 302) {
      const cacheControl = String(response.headers["cache-control"] ?? "");
      const maxAge = Number(/max-age=(\d+)/.exec(cacheControl)?.[1] ?? "0");
      expect(cacheControl).not.toContain("stale-while-revalidate");
      expect(maxAge).toBeLessThanOrEqual(3600);
    }
  });
});
