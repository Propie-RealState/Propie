import { API_URL } from "../../../../lib/api-base";
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

  const response = await fetch(
    `${API_URL}/search?${params.toString()}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("No pudimos completar la búsqueda.");
  }

  return response.json();
}
