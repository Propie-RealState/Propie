import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  PROPERTY_STATUSES,
  type PropertyLifecycleStatus,
} from "@/modules/properties/constants/property-status.constants";
import {
  assertPropertyStatusTransition,
  getAllowedPropertyStatusTransitions,
  PropertyStatusTransitionError,
} from "@/modules/properties/utils/property-status-transitions";
import { updatePropertyStatusService } from "@/modules/properties/services/update-property-status.service";
import {
  cleanupProperty,
  cleanupTestUsers,
  insertPropertyImage,
  registerUserViaApi,
} from "../helpers/auth-fixtures";
import { createTestUser } from "../helpers/test-users";
import { ensurePropertyStatusSchema } from "../helpers/ensure-property-status-schema";

const ALL_STATUSES = Object.values(PROPERTY_STATUSES);

const LEGAL_TRANSITIONS: [PropertyLifecycleStatus, PropertyLifecycleStatus][] = [
  [PROPERTY_STATUSES.ACTIVE, PROPERTY_STATUSES.PAUSED],
  [PROPERTY_STATUSES.ACTIVE, PROPERTY_STATUSES.RESERVED],
  [PROPERTY_STATUSES.ACTIVE, PROPERTY_STATUSES.FINALIZED],
  [PROPERTY_STATUSES.PAUSED, PROPERTY_STATUSES.ACTIVE],
  [PROPERTY_STATUSES.PAUSED, PROPERTY_STATUSES.RESERVED],
  [PROPERTY_STATUSES.PAUSED, PROPERTY_STATUSES.FINALIZED],
  [PROPERTY_STATUSES.RESERVED, PROPERTY_STATUSES.ACTIVE],
  [PROPERTY_STATUSES.RESERVED, PROPERTY_STATUSES.PAUSED],
  [PROPERTY_STATUSES.RESERVED, PROPERTY_STATUSES.FINALIZED],
];

async function insertPublishedProperty(input: {
  ownerId: string;
  publisherId: string;
  publisherType?: "OWNER" | "AGENT";
  status?: PropertyLifecycleStatus;
}) {
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, now())
      RETURNING id
    `,
    [
      input.ownerId,
      "Transition Test",
      "HOUSE",
      "SALE",
      input.status ?? PROPERTY_STATUSES.ACTIVE,
      input.publisherId,
      input.publisherType ?? "OWNER",
    ],
  );

  return property.rows[0].id;
}

describe("property status transition matrix", () => {
  beforeAll(async () => {
    await ensurePropertyStatusSchema();
  });

  it("exposes allowed targets per status", () => {
    expect(getAllowedPropertyStatusTransitions(PROPERTY_STATUSES.ACTIVE)).toEqual(
      [PROPERTY_STATUSES.PAUSED, PROPERTY_STATUSES.RESERVED, PROPERTY_STATUSES.FINALIZED],
    );
    expect(getAllowedPropertyStatusTransitions(PROPERTY_STATUSES.FINALIZED)).toEqual([]);
  });

  it.each(LEGAL_TRANSITIONS)(
    "allows %s → %s",
    (from, to) => {
      expect(() => assertPropertyStatusTransition(from, to)).not.toThrow();
    },
  );

  it("allows no-op transitions", () => {
    for (const status of ALL_STATUSES) {
      expect(() => assertPropertyStatusTransition(status, status)).not.toThrow();
    }
  });

  it.each(
    ALL_STATUSES.flatMap((from) =>
      ALL_STATUSES.filter((to) => to !== from).map((to) => [from, to] as const),
    ).filter(
      ([from, to]) =>
        !LEGAL_TRANSITIONS.some(([legalFrom, legalTo]) => legalFrom === from && legalTo === to),
    ),
  )("rejects illegal transition %s → %s", (from, to) => {
    expect(() => assertPropertyStatusTransition(from, to)).toThrow(
      PropertyStatusTransitionError,
    );
  });
});

describe("property status service transitions", () => {
  const propertyIds: string[] = [];
  let ownerId: string;

  beforeAll(async () => {
    await ensurePropertyStatusSchema();
    ownerId = await createTestUser("OWNER");
  });

  afterAll(async () => {
    for (const id of propertyIds) {
      await cleanupProperty(id);
    }
    await cleanupTestUsers([ownerId]);
  });

  it.each(LEGAL_TRANSITIONS)(
    "service accepts legal %s → %s",
    async (from, to) => {
      const propertyId = await insertPublishedProperty({
        ownerId,
        publisherId: ownerId,
        status: from,
      });
      propertyIds.push(propertyId);

      const updated = await updatePropertyStatusService({
        userId: ownerId,
        propertyId,
        status: to,
      });

      expect(updated.status).toBe(to);
    },
  );

  it("service rejects FINALIZED → ACTIVE", async () => {
    const propertyId = await insertPublishedProperty({
      ownerId,
      publisherId: ownerId,
      status: PROPERTY_STATUSES.FINALIZED,
    });
    propertyIds.push(propertyId);

    await expect(
      updatePropertyStatusService({
        userId: ownerId,
        propertyId,
        status: PROPERTY_STATUSES.ACTIVE,
      }),
    ).rejects.toThrow(PropertyStatusTransitionError);
  });
});

describe("property status route hardening", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let client: Awaited<ReturnType<typeof registerUserViaApi>>;
  let propertyId: string;
  const userIds: string[] = [];

  async function patchBasic(token: string) {
    return app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/basic`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: "Casa en Cordoba",
        description: "Hermosa casa",
        price: 250000,
        currency: "USD",
        bedrooms: 3,
        bathrooms: 2,
        areaM2: 180,
        propertyType: "HOUSE",
        operationType: "SALE",
      },
    });
  }

  async function publishProperty(token: string) {
    return app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/publish`,
      headers: { authorization: `Bearer ${token}` },
    });
  }

  beforeAll(async () => {
    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    client = await registerUserViaApi(app, "CLIENT");
    userIds.push(owner.userId, client.userId);

    const createResponse = await app.inject({
      method: "POST",
      url: "/properties",
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: { propertyType: "HOUSE", listingType: "SALE" },
    });
    propertyId = createResponse.json().propertyId;
  });

  afterAll(async () => {
    if (propertyId) {
      await cleanupProperty(propertyId);
    }
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("blocks CLIENT from status mutation at route layer", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/status`,
      headers: { authorization: `Bearer ${client.accessToken}` },
      payload: { status: "PAUSED" },
    });

    expect(response.statusCode).toBe(403);
  });

  it("blocks CLIENT from publish mutation at route layer", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/publish`,
      headers: { authorization: `Bearer ${client.accessToken}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it("rejects illegal status transition via API", async () => {
    await patchBasic(owner.accessToken!);
    await insertPropertyImage(propertyId);

    const publishResponse = await publishProperty(owner.accessToken!);
    expect(publishResponse.statusCode).toBe(200);

    await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/status`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: { status: "FINALIZED" },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/properties/${propertyId}/status`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: { status: "ACTIVE" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_STATUS_TRANSITION");
  });

  it("rejects republish with 409", async () => {
    const response = await publishProperty(owner.accessToken!);

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe("ALREADY_PUBLISHED");
  });
});
