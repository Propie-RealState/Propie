import { useEffect, useState } from "react";

import { useAuth } from "../../../../context/AuthContext";
import { getOwnerAgentApplicationsCount } from "../services/agent-applications.service";

export function useOwnerApplicationCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  async function refresh() {
    if (!user || user.role === "AGENT") {
      setCount(0);
      return;
    }

    try {
      const pendingCount = await getOwnerAgentApplicationsCount();
      setCount(pendingCount);
    } catch (error) {
      console.error("Error loading application notifications", error);
      setCount(0);
    }
  }

  useEffect(() => {
    refresh();

    window.addEventListener("agent-applications:changed", refresh);

    return () => {
      window.removeEventListener("agent-applications:changed", refresh);
    };
  }, [user?.id, user?.role]);

  return {
    count,
    refresh,
  };
}
