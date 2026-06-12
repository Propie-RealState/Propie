import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuth } from "../../../../context/AuthContext";
import { getOwnerAgentApplicationsCount } from "../services/agent-applications.service";
import { queryClient } from "../../../../lib/query-client";

export function useOwnerApplicationCount() {
  const { user } = useAuth();

  const { data: count = 0, refetch } = useQuery({
    queryKey: ["agent-applications", "owner-count", user?.id],
    queryFn: async () => {
      if (!user || user.role === "AGENT") {
        return 0;
      }

      try {
        return await getOwnerAgentApplicationsCount();
      } catch (error) {
        console.error("Error loading application notifications", error);
        return 0;
      }
    },
    enabled: Boolean(user && user.role !== "AGENT"),
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const handleChange = () => {
      void queryClient.invalidateQueries({
        queryKey: ["agent-applications", "owner-count", user.id],
      });
    };

    window.addEventListener("agent-applications:changed", handleChange);

    return () => {
      window.removeEventListener("agent-applications:changed", handleChange);
    };
  }, [user?.id]);

  return {
    count,
    refresh: () => {
      void refetch();
    },
  };
}
