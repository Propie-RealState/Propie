import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getUserReviews, type AgentReview } from "../services/agents.service";

export function useAgentReviews(agentId: string | undefined, initialLimit = 3) {
  const [limit, setLimit] = useState(initialLimit);

  const { data = [], isFetching, refetch } = useQuery({
    queryKey: ["agents", "reviews", agentId, limit],
    queryFn: async () => {
      const fetchLimit = limit + 1;
      return getUserReviews(agentId!, fetchLimit, 0);
    },
    enabled: Boolean(agentId),
  });

  const hasMore = data.length > limit;

  const reviews: AgentReview[] = useMemo(
    () => (hasMore ? data.slice(0, limit) : data),
    [data, hasMore, limit],
  );

  function loadMore() {
    setLimit((previous) => previous + 5);
  }

  function refresh() {
    void refetch();
  }

  return { reviews, loading: isFetching, hasMore, loadMore, refresh };
}
