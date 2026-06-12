import { apiFetch } from "../../../../lib/api";
import type { GlobalSearchResponse } from "../types/global-search.types";

const EMPTY_RESULTS: GlobalSearchResponse = {
  query: "",
  properties: [],
  locations: [],
  agents: [],
  owners: [],
};

export async function fetchGlobalSearch(
  query: string,
  signal?: AbortSignal,
  limit = 8,
): Promise<GlobalSearchResponse> {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return EMPTY_RESULTS;
  }

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
  });

  return apiFetch<GlobalSearchResponse>(`/search?${params.toString()}`, {
    signal,
  });
}
