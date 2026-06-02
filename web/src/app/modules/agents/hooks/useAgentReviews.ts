import { useEffect, useState } from "react";
import { getAgentReviews, type AgentReview } from "../services/agents.service";

export function useAgentReviews(agentId: string | undefined, initialLimit = 3) {
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!agentId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      const FETCH_LIMIT = limit + 1;
      const data = await getAgentReviews(agentId!, FETCH_LIMIT, 0);

      if (cancelled) return;

      if (data.length > limit) {
        setReviews(data.slice(0, limit));
        setHasMore(true);
      } else {
        setReviews(data);
        setHasMore(false);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [agentId, limit, reloadToken]);

  function loadMore() {
    setLimit((prev) => prev + 5);
  }

  function refresh() {
    setReloadToken((prev) => prev + 1);
  }

  return { reviews, loading, hasMore, loadMore, refresh };
}
