import { useEffect, useRef, useState } from "react";

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
  const abortRef = useRef<AbortController | null>(null);
  const [results, setResults] =
    useState<GlobalSearchResponse>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    abortRef.current?.abort();

    if (trimmed.length < 2) {
      setResults(EMPTY_RESULTS);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchGlobalSearch(
      trimmed,
      controller.signal,
    )
      .then((response) => {
        setResults(response);
      })
      .catch((requestError) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setResults(EMPTY_RESULTS);
        setError("No pudimos buscar en este momento.");
      })
      .finally(() => {
        if (abortRef.current === controller) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const hasResults =
    results.properties.length > 0 ||
    results.locations.length > 0 ||
    results.agents.length > 0 ||
    results.owners.length > 0;

  return {
    results,
    loading,
    error,
    hasResults,
    isActive: debouncedQuery.trim().length >= 2,
  };
}
