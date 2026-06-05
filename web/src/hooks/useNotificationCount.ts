import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { getUnreadNotificationCount } from '../app/modules/notifications/services/notifications.service';
import { useOwnerApplicationCount } from '../app/modules/agent-applications/hooks/useOwnerApplicationCount';
import { canPublishProperties } from '../lib/roles';

export function useNotificationCount() {
  const { user } = useAuth();
  const { count: ownerPendingCount } = useOwnerApplicationCount();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();

    const interval = window.setInterval(refresh, 60_000);
    return () => {
      window.clearInterval(interval);
    };
  }, [refresh]);

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
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    window.addEventListener('notifications:changed', refresh);
    return () => {
      window.removeEventListener('notifications:changed', refresh);
    };
  }, [refresh, user?.id, tick]);

  return refresh;
}
