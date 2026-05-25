import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { useOwnerApplicationCount } from '../app/modules/agent-applications/hooks/useOwnerApplicationCount';
import { canPublishProperties } from '../lib/roles';

export function useNotificationCount() {
  const { user } = useAuth();
  const { count: ownerPendingCount } = useOwnerApplicationCount();
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    if (!user || canPublishProperties(user.role)) {
      setClientCount(0);
      return;
    }

    let cancelled = false;

    async function loadNotifications() {
      try {
        const response = await apiFetch('/notifications');
        const items = response?.data;

        if (!cancelled && Array.isArray(items)) {
          setClientCount(items.length);
        }
      } catch {
        if (!cancelled) {
          setClientCount(0);
        }
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  if (!user) {
    return 0;
  }

  if (canPublishProperties(user.role)) {
    return ownerPendingCount;
  }

  return clientCount;
}
