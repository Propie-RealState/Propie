import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { listPropertyConversations } from "../app/modules/property-conversations/services/property-conversations.service";
import { useAuth } from "../context/AuthContext";
import { queryClient } from "../lib/query-client";

export function useUnreadConversationCount() {
  const { user } = useAuth();

  const { data: count = 0 } = useQuery({
    queryKey: ["conversations", "unread-count", user?.id],
    queryFn: async () => {
      const conversations = await listPropertyConversations();
      return conversations.filter(
        (conversation) => (conversation.unreadCount ?? 0) > 0,
      ).length;
    },
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const handleChange = () => {
      void queryClient.invalidateQueries({
        queryKey: ["conversations", "unread-count", user.id],
      });
    };

    window.addEventListener("property-conversations:changed", handleChange);

    return () => {
      window.removeEventListener("property-conversations:changed", handleChange);
    };
  }, [user?.id]);

  if (!user) {
    return 0;
  }

  return count;
}
