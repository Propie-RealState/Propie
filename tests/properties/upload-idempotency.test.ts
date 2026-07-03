import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupProperty,
  cleanupTestUsers,
  registerUserViaApi,
} from "../helpers/auth-fixtures";

const uploadMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();

  return {
    ...actual,
    uploadToStorage: (...args: unknown[]) => uploadMock(...args),
    deleteFromStorage: (...args: unknown[]) => deleteMock(...args),
  };
});

// 1×1 PNG
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function imageMultipartPayload(buffer: Buffer, boundary = "----upload") {
  return Buffer.concat([
    Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="files"; filename="photo.png"\r\n` +
        `Content-Type: image/png\r\n\r\n`,
    ),
    buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
}

describe("property media uploads", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const userIds: string[] = [];
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let propertyId: string;

  beforeEach(async () => {
    uploadMock.mockReset();
    deleteMock.mockReset();
    uploadMock.mockImplementation(async (path: string) => path);

    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    userIds.push(owner.userId);

    const createResponse = await app.inject({
      method: "POST",
      url: "/properties",
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: {
        propertyType: "HOUSE",
        listingType: "SALE",
      },
    });

    propertyId = createResponse.json().propertyId;
  });

  afterEach(async () => {
    if (propertyId) {
      await cleanupProperty(propertyId);
    }

    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("returns the same image row when uploading duplicate content", async () => {
    const boundary = "----dup";

    const first = await app.inject({
      method: "POST",
      url: `/properties/${propertyId}/images`,
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: imageMultipartPayload(TINY_PNG, boundary),
    });

    expect(first.statusCode).toBe(200);
    const firstBody = first.json();
    expect(firstBody.images).toHaveLength(1);

    uploadMock.mockClear();

    const second = await app.inject({
      method: "POST",
      url: `/properties/${propertyId}/images`,
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: imageMultipartPayload(TINY_PNG, boundary),
    });

    expect(second.statusCode).toBe(200);
    const secondBody = second.json();
    expect(secondBody.images).toHaveLength(1);
    expect(secondBody.images[0].id).toBe(firstBody.images[0].id);
    expect(uploadMock).not.toHaveBeenCalled();

    const count = await db.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM property_images WHERE property_id = $1`,
      [propertyId],
    );

    expect(count.rows[0].total).toBe(1);
  });

  it("rolls back storage when the database insert fails", async () => {
    const insertSpy = vi
      .spyOn(
        await import(
          "@/modules/properties/repositories/property-media.repository"
        ),
        "createPropertyImageRepository",
      )
      .mockRejectedValueOnce(new Error("DB_INSERT_FAILED"));

    const boundary = "----rollback";

    const response = await app.inject({
      method: "POST",
      url: `/properties/${propertyId}/images`,
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: imageMultipartPayload(TINY_PNG, boundary),
    });

    insertSpy.mockRestore();

    expect(response.statusCode).toBe(500);
    expect(uploadMock).toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalled();

    const count = await db.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM property_images WHERE property_id = $1`,
      [propertyId],
    );

    expect(count.rows[0].total).toBe(0);
  });
});
