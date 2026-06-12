import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "../../map/hooks/useDebouncedValue";
import { fetchGlobalSearch } from "../services/global-search.service";
import type { GlobalSearchResponse } from "../types/global-search.types";

const EMPTY_RESULTS: GlobalSearchResponse = {
  query: "",
  properties: [],
  locations: [],
  agents: [],
  owners: [],
};

export function useGlobalSearch(
  query: string,
  debounceMs = 300,
) {
  const debouncedQuery = useDebouncedValue(
    query,
    debounceMs,
  );
  const trimmed = debouncedQuery.trim();
  const isActive = trimmed.length >= 2;

  const { data, isFetching, error } = useQuery({
    queryKey: ["search", trimmed],
    queryFn: async ({ signal }) => {
      try {
        return await fetchGlobalSearch(trimmed, signal);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          throw requestError;
        }

        throw new Error("No pudimos buscar en este momento.");
      }
    },
    enabled: isActive,
  });

  const results = isActive ? (data ?? EMPTY_RESULTS) : EMPTY_RESULTS;

  const hasResults =
    results.properties.length > 0 ||
    results.locations.length > 0 ||
    results.agents.length > 0 ||
    results.owners.length > 0;

  return {
    results,
    loading: isActive && isFetching,
    error: isActive && error ? error.message : null,
    hasResults,
    isActive,
  };
}
