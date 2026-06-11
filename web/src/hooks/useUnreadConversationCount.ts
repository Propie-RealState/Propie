import { useCallback, useEffect, useState } from "react";

import { listPropertyConversations } from "../app/modules/property-conversations/services/property-conversations.service";
import { useAuth } from "../context/AuthContext";

export function useUnreadConversationCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setCount(0);
      return;
    }

    try {
      const conversations = await listPropertyConversations();
      setCount(
        conversations.filter(
          (conversation) => (conversation.unreadCount ?? 0) > 0,
        ).length,
      );
    } catch {
      setCount(0);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 60_000);

    const handleChange = () => {
      void refresh();
    };

    window.addEventListener("property-conversations:changed", handleChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("property-conversations:changed", handleChange);
    };
  }, [refresh]);

  if (!user) {
    return 0;
  }

  return count;
}
