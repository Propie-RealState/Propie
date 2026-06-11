import { useCallback, useEffect, useState } from "react";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "../services/notifications.service";
import { excludePropertyConversationNotifications } from "../utils/notification-filters";
import { getNotificationRoute } from "../utils/notification-ui";

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const load = useCallback(async (nextOffset = 0, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getNotifications({
        limit: 20,
        offset: nextOffset,
      });

      const visibleItems = excludePropertyConversationNotifications(
        response.items,
      );

      setItems((current) =>
        append ? [...current, ...visibleItems] : visibleItems,
      );
      setOffset(nextOffset + response.items.length);
      setHasMore(Boolean(response.meta?.hasMore));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(0, false);
  }, [load]);

  const markRead = useCallback(async (notificationId: string) => {
    await markNotificationRead(notificationId);
    setItems((current) =>
      current.map((item) =>
        item.id === notificationId
          ? { ...item, read: true, readAt: new Date().toISOString() }
          : item,
      ),
    );
    window.dispatchEvent(new Event("notifications:changed"));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setItems((current) =>
      current.map((item) => ({
        ...item,
        read: true,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
    );
    window.dispatchEvent(new Event("notifications:changed"));
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    await load(offset, true);
  }, [hasMore, load, loadingMore, offset]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    markRead,
    markAllRead,
    loadMore,
    reload: () => load(0, false),
    getRoute: getNotificationRoute,
  };
}
