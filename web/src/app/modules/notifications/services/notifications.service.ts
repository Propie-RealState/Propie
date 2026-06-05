import { apiFetch } from "../../../../lib/api";

export type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  read: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPreferences = {
  userId: string;
  nearbyEnabled: boolean;
  favoritesEnabled: boolean;
  messagesEnabled: boolean;
  agentApplicationsEnabled: boolean;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
};

export async function getNotifications(input?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}) {
  const params = new URLSearchParams();

  if (input?.limit !== undefined) {
    params.set("limit", String(input.limit));
  }

  if (input?.offset !== undefined) {
    params.set("offset", String(input.offset));
  }

  if (input?.unreadOnly) {
    params.set("unreadOnly", "true");
  }

  const query = params.toString();
  const response = await apiFetch(
    `/notifications${query ? `?${query}` : ""}`,
  );

  return {
    items: (response?.data ?? []) as NotificationItem[],
    meta: response?.meta ?? {
      total: 0,
      limit: 20,
      offset: 0,
      hasMore: false,
    },
  };
}

export async function getUnreadNotificationCount() {
  const response = await apiFetch("/notifications/unread-count");
  return Number(response?.data?.count ?? 0);
}

export async function markNotificationRead(notificationId: string) {
  const response = await apiFetch(
    `/notifications/${notificationId}/read`,
    { method: "PATCH" },
  );

  return response?.data as NotificationItem;
}

export async function markAllNotificationsRead() {
  const response = await apiFetch("/notifications/read-all", {
    method: "PATCH",
  });

  return Number(response?.data?.updatedCount ?? 0);
}

export async function getNotificationPreferences() {
  const response = await apiFetch("/notifications/preferences");
  return response?.data as NotificationPreferences;
}

export async function updateNotificationPreferences(
  preferences: Partial<
    Omit<NotificationPreferences, "userId">
  >,
) {
  const response = await apiFetch("/notifications/preferences", {
    method: "PATCH",
    body: JSON.stringify(preferences),
  });

  return response?.data as NotificationPreferences;
}
