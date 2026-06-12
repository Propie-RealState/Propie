import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getMapProperties } from "../services/map.service";
import { useMapStore } from "../stores/useMapStore";
import type { MapResult } from "../types/map.types";
import { useDebouncedValue } from "./useDebouncedValue";

export function useMapProperties() {
  const bounds = useMapStore((state) => state.bounds);
  const zoom = useMapStore((state) => state.viewport.zoom);
  const filters = useMapStore((state) => state.filters);
  const setHasMovedSinceSearch = useMapStore(
    (state) => state.setHasMovedSinceSearch,
  );

  const [refreshKey, setRefreshKey] = useState(0);

  const requestInput = useMemo(
    () => ({
      bounds,
      zoom: Math.round(zoom * 10) / 10,
      filters,
      refreshKey,
    }),
    [bounds, filters, refreshKey, zoom],
  );

  const debouncedInput = useDebouncedValue(requestInput, 320);

  const { data, isFetching, error } = useQuery({
    queryKey: ["map", "properties", debouncedInput],
    queryFn: ({ signal }) =>
      getMapProperties({
        bounds: debouncedInput.bounds!,
        zoom: debouncedInput.zoom,
        filters: debouncedInput.filters,
        signal,
      }),
    enabled: Boolean(debouncedInput.bounds),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (data) {
      setHasMovedSinceSearch(false);
    }
  }, [data, setHasMovedSinceSearch]);

  const reload = useCallback(() => {
    setRefreshKey((value) => value + 1);
    setHasMovedSinceSearch(false);
  }, [setHasMovedSinceSearch]);

  const items = data?.items ?? [];

  const properties = useMemo(
    () =>
      items.filter(
        (item): item is Extract<MapResult, { type: "property" }> =>
          item.type === "property",
      ),
    [items],
  );

  return {
    items,
    properties,
    loading: isFetching,
    error: error
      ? error instanceof Error
        ? error.message
        : "No pudimos cargar el mapa"
      : null,
    reload,
  };
}
