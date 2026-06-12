import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../context/AuthContext";
import { getUnreadNotificationCount } from "../app/modules/notifications/services/notifications.service";
import { useOwnerApplicationCount } from "../app/modules/agent-applications/hooks/useOwnerApplicationCount";
import { canPublishProperties } from "../lib/roles";
import { queryClient } from "../lib/query-client";

export function useNotificationCount() {
  const { user } = useAuth();
  const { count: ownerPendingCount } = useOwnerApplicationCount();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count", user?.id],
    queryFn: async () => {
      try {
        return await getUnreadNotificationCount();
      } catch {
        return 0;
      }
    },
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const handleChange = () => {
      void queryClient.refetchQueries({
        queryKey: ["notifications", "unread-count", user.id],
      });
    };

    window.addEventListener("notifications:changed", handleChange);

    return () => {
      window.removeEventListener("notifications:changed", handleChange);
    };
  }, [user?.id]);

  if (!user) {
    return 0;
  }

  if (canPublishProperties(user.role)) {
    return Math.max(unreadCount, ownerPendingCount);
  }

  return unreadCount;
}

export function useRefreshNotificationCount() {
  const { user } = useAuth();

  return () => {
    if (!user) {
      return;
    }

    void queryClient.refetchQueries({
      queryKey: ["notifications", "unread-count", user.id],
    });
  };
}
