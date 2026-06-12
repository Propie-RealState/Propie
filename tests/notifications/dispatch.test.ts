import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import { NOTIFICATION_TYPES } from "@/modules/notifications/types/notification.types";
import {
  createNotification,
  createNotifications,
} from "@/modules/notifications/services/notification.service";
import {
  cleanupTestUsers,
  registerUserViaApi,
} from "../helpers/auth-fixtures";

vi.mock("@/modules/notifications/services/notification-push.service", () => ({
  sendPushForNotifications: vi.fn().mockResolvedValue(undefined),
  getPublicVapidKey: vi.fn(),
  registerPushSubscription: vi.fn(),
  unregisterPushSubscription: vi.fn(),
}));

describe("notification dispatch", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let recipientA: Awaited<ReturnType<typeof registerUserViaApi>>;
  let recipientB: Awaited<ReturnType<typeof registerUserViaApi>>;
  const userIds: string[] = [];
  const notificationIds: string[] = [];

  beforeAll(async () => {
    app = await buildApp();
    recipientA = await registerUserViaApi(app, "CLIENT");
    recipientB = await registerUserViaApi(app, "OWNER");
    userIds.push(recipientA.userId, recipientB.userId);
  });

  afterAll(async () => {
    if (notificationIds.length > 0) {
      await db.query(`DELETE FROM notifications WHERE id = ANY($1::uuid[])`, [
        notificationIds,
      ]);
    }
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("creates a notification row in the database", async () => {
    const notification = await createNotification({
      userId: recipientA.userId,
      type: NOTIFICATION_TYPES.PROPERTY_UPDATED,
      title: "Propiedad actualizada",
      body: "Se actualizó una propiedad",
      entityType: "property",
      entityId: "00000000-0000-4000-8000-000000000001",
    });

    notificationIds.push(notification.id);

    const row = await db.query<{ title: string; read_at: string | null }>(
      `SELECT title, read_at FROM notifications WHERE id = $1`,
      [notification.id],
    );

    expect(row.rows[0].title).toBe("Propiedad actualizada");
    expect(row.rows[0].read_at).toBeNull();
  });

  it("fans out notifications to multiple recipients", async () => {
    const notifications = await createNotifications([
      {
        userId: recipientA.userId,
        type: NOTIFICATION_TYPES.NEW_PROPERTY_NEARBY,
        title: "Nueva propiedad",
        body: "Hay una propiedad cerca",
        entityType: "property",
        entityId: "00000000-0000-4000-8000-000000000002",
      },
      {
        userId: recipientB.userId,
        type: NOTIFICATION_TYPES.NEW_PROPERTY_NEARBY,
        title: "Nueva propiedad",
        body: "Hay una propiedad cerca",
        entityType: "property",
        entityId: "00000000-0000-4000-8000-000000000002",
      },
    ]);

    notificationIds.push(...notifications.map((item) => item.id));

    expect(notifications).toHaveLength(2);

    const countRow = await db.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM notifications
        WHERE id = ANY($1::uuid[])
      `,
      [notificationIds],
    );

    expect(Number(countRow.rows[0].count)).toBeGreaterThanOrEqual(3);
  });

  it("returns unread counts via the API", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/notifications/unread-count",
      headers: { authorization: `Bearer ${recipientA.accessToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.count).toBeGreaterThanOrEqual(2);
  });

  it("marks a single notification as read", async () => {
    const unread = notificationIds[0];

    const response = await app.inject({
      method: "PATCH",
      url: `/notifications/${unread}/read`,
      headers: { authorization: `Bearer ${recipientA.accessToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.read_at).not.toBeNull();

    const countResponse = await app.inject({
      method: "GET",
      url: "/notifications/unread-count",
      headers: { authorization: `Bearer ${recipientA.accessToken}` },
    });

    expect(countResponse.json().data.count).toBeGreaterThanOrEqual(1);
  });

  it("marks all notifications as read", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: "/notifications/read-all",
      headers: { authorization: `Bearer ${recipientA.accessToken}` },
    });

    expect(response.statusCode).toBe(200);

    const countResponse = await app.inject({
      method: "GET",
      url: "/notifications/unread-count",
      headers: { authorization: `Bearer ${recipientA.accessToken}` },
    });

    expect(countResponse.json().data.count).toBe(0);
  });
});
