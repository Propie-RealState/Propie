import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "../services/notifications.service";
import { excludePropertyConversationNotifications } from "../utils/notification-filters";
import { getNotificationRoute } from "../utils/notification-ui";

const PAGE_SIZE = 20;
const NOTIFICATIONS_LIST_KEY = ["notifications", "list"] as const;

type NotificationsPage = {
  visibleItems: NotificationItem[];
  rawCount: number;
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

function patchNotificationsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  patch: (item: NotificationItem) => NotificationItem,
) {
  queryClient.setQueryData<InfiniteData<NotificationsPage>>(
    NOTIFICATIONS_LIST_KEY,
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          visibleItems: page.visibleItems.map(patch),
        })),
      };
    },
  );
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: NOTIFICATIONS_LIST_KEY,
    queryFn: async ({ pageParam }) => {
      const response = await getNotifications({
        limit: PAGE_SIZE,
        offset: pageParam,
      });

      return {
        visibleItems: excludePropertyConversationNotifications(
          response.items,
        ),
        rawCount: response.items.length,
        meta: response.meta ?? {
          total: 0,
          limit: PAGE_SIZE,
          offset: pageParam,
          hasMore: false,
        },
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.meta?.hasMore) {
        return undefined;
      }

      return allPages.reduce((offset, page) => offset + page.rawCount, 0);
    },
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.visibleItems) ?? [],
    [query.data],
  );

  const invalidateUnreadCount = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["notifications", "unread-count"],
    });
    window.dispatchEvent(new Event("notifications:changed"));
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (_, notificationId) => {
      patchNotificationsCache(queryClient, (item) =>
        item.id === notificationId
          ? { ...item, read: true, readAt: new Date().toISOString() }
          : item,
      );
      invalidateUnreadCount();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      patchNotificationsCache(queryClient, (item) => ({
        ...item,
        read: true,
        readAt: item.readAt ?? new Date().toISOString(),
      }));
      invalidateUnreadCount();
    },
  });

  const markRead = useCallback(
    async (notificationId: string) => {
      await markReadMutation.mutateAsync(notificationId);
    },
    [markReadMutation],
  );

  const markAllRead = useCallback(async () => {
    await markAllReadMutation.mutateAsync();
  }, [markAllReadMutation]);

  const loadMore = useCallback(async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) {
      return;
    }

    await query.fetchNextPage();
  }, [query]);

  const reload = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    items,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    hasMore: Boolean(query.hasNextPage),
    markRead,
    markAllRead,
    loadMore,
    reload,
    getRoute: getNotificationRoute,
  };
}
