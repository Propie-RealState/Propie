import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupProperty,
  cleanupTestUsers,
  registerUserViaApi,
} from "../helpers/auth-fixtures";

const signedUrlMock = vi.fn();
const uploadMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("@/lib/supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase")>();

  return {
    ...actual,
    uploadToStorage: (...args: unknown[]) => uploadMock(...args),
    createSignedStorageUrl: (...args: unknown[]) => signedUrlMock(...args),
    deleteFromStorage: (...args: unknown[]) => deleteMock(...args),
  };
});

describe("storage security", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const userIds: string[] = [];
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let stranger: Awaited<ReturnType<typeof registerUserViaApi>>;
  let draftPropertyId: string;

  beforeEach(async () => {
    signedUrlMock.mockReset();
    uploadMock.mockReset();
    deleteMock.mockReset();

    signedUrlMock.mockImplementation(async (path: string) =>
      `https://signed.example/${path}?expires=1`,
    );
    uploadMock.mockImplementation(
      async (path: string) => path,
    );

    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    stranger = await registerUserViaApi(app, "CLIENT");
    userIds.push(owner.userId, stranger.userId);

    const createResponse = await app.inject({
      method: "POST",
      url: "/properties",
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: {
        propertyType: "HOUSE",
        listingType: "SALE",
      },
    });

    draftPropertyId = createResponse.json().propertyId;
  });

  afterEach(async () => {
    if (draftPropertyId) {
      await cleanupProperty(draftPropertyId);
    }

    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("denies anonymous access to draft property media", async () => {
    const storagePath = `images/${draftPropertyId}/secret.webp`;

    await db.query(
      `
        INSERT INTO property_images (
          property_id,
          image_url,
          thumb_url,
          is_cover,
          display_order
        )
        VALUES ($1, $2, $2, true, 0)
      `,
      [draftPropertyId, storagePath],
    );

    const response = await app.inject({
      method: "GET",
      url: `/media/${storagePath}`,
    });

    expect(response.statusCode).toBe(403);
    expect(signedUrlMock).not.toHaveBeenCalled();
  });

  it("allows the owner to access draft property media via signed URL", async () => {
    const storagePath = `images/${draftPropertyId}/owner.webp`;

    await db.query(
      `
        INSERT INTO property_images (
          property_id,
          image_url,
          thumb_url,
          is_cover,
          display_order
        )
        VALUES ($1, $2, $2, true, 0)
      `,
      [draftPropertyId, storagePath],
    );

    const response = await app.inject({
      method: "GET",
      url: `/media/${storagePath}`,
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
      },
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(
      `https://signed.example/${storagePath}?expires=1`,
    );
    expect(signedUrlMock).toHaveBeenCalledWith(storagePath);
  });

  it("denies strangers from accessing draft property media", async () => {
    const storagePath = `images/${draftPropertyId}/blocked.webp`;

    await db.query(
      `
        INSERT INTO property_images (
          property_id,
          image_url,
          thumb_url,
          is_cover,
          display_order
        )
        VALUES ($1, $2, $2, true, 0)
      `,
      [draftPropertyId, storagePath],
    );

    const response = await app.inject({
      method: "GET",
      url: `/media/${storagePath}`,
      headers: {
        authorization: `Bearer ${stranger.accessToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("rejects SVG avatar uploads", async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><text>x</text></svg>',
    );

    const response = await app.inject({
      method: "POST",
      url: "/profile/me/avatar",
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        "content-type": "multipart/form-data; boundary=----test",
      },
      payload:
        `------test\r\n` +
        `Content-Disposition: form-data; name="file"; filename="avatar.svg"\r\n` +
        `Content-Type: image/svg+xml\r\n\r\n` +
        `${svg.toString("utf8")}\r\n` +
        `------test--\r\n`,
    });

    expect(response.statusCode).toBe(400);
    expect(["INVALID_EXTENSION", "INVALID_MIME_TYPE"]).toContain(
      response.json().error?.code,
    );
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects HTML disguised as an image upload", async () => {
    const html = Buffer.from("<html><body>evil</body></html>");

    const response = await app.inject({
      method: "POST",
      url: "/profile/me/avatar",
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
        "content-type": "multipart/form-data; boundary=----test",
      },
      payload:
        `------test\r\n` +
        `Content-Disposition: form-data; name="file"; filename="avatar.jpg"\r\n` +
        `Content-Type: text/html\r\n\r\n` +
        `${html.toString("utf8")}\r\n` +
        `------test--\r\n`,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error?.code).toBe("INVALID_MIME_TYPE");
  });
});
