import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MAP_UNCLUSTERED_ZOOM } from "../constants/map-clustering";
import { getMapProperties } from "../services/map.service";
import { useMapStore } from "../stores/useMapStore";
import type { MapResult, PropertyPin } from "../types/map.types";
import { countVisibleMapProperties } from "../utils/map-visible-count";
import { useDebouncedValue } from "./useDebouncedValue";

function isPropertyPin(
  item: MapResult,
): item is PropertyPin {
  return item.type === "property";
}

export function useMapProperties() {
  const bounds = useMapStore((state) => state.bounds);
  const zoom = useMapStore((state) => state.viewport.zoom);
  const filters = useMapStore((state) => state.filters);
  const setHasMovedSinceSearch = useMapStore(
    (state) => state.setHasMovedSinceSearch,
  );

  const [refreshKey, setRefreshKey] = useState(0);

  const markerInput = useMemo(
    () => ({
      bounds,
      zoom: Math.round(zoom * 10) / 10,
      filters,
      refreshKey,
    }),
    [bounds, filters, refreshKey, zoom],
  );

  const listInput = useMemo(
    () => ({
      bounds,
      zoom: MAP_UNCLUSTERED_ZOOM,
      filters,
      refreshKey,
    }),
    [bounds, filters, refreshKey],
  );

  const debouncedMarkerInput = useDebouncedValue(markerInput, 320);
  const debouncedListInput = useDebouncedValue(listInput, 320);

  const markerQuery = useQuery({
    queryKey: ["map", "markers", debouncedMarkerInput],
    queryFn: ({ signal }) =>
      getMapProperties({
        bounds: debouncedMarkerInput.bounds!,
        zoom: debouncedMarkerInput.zoom,
        filters: debouncedMarkerInput.filters,
        signal,
      }),
    enabled: Boolean(debouncedMarkerInput.bounds),
    placeholderData: (previousData) => previousData,
  });

  const listQuery = useQuery({
    queryKey: ["map", "list", debouncedListInput],
    queryFn: ({ signal }) =>
      getMapProperties({
        bounds: debouncedListInput.bounds!,
        zoom: debouncedListInput.zoom,
        filters: debouncedListInput.filters,
        signal,
      }),
    enabled: Boolean(debouncedListInput.bounds),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (markerQuery.data || listQuery.data) {
      setHasMovedSinceSearch(false);
    }
  }, [listQuery.data, markerQuery.data, setHasMovedSinceSearch]);

  const reload = useCallback(() => {
    setRefreshKey((value) => value + 1);
    setHasMovedSinceSearch(false);
  }, [setHasMovedSinceSearch]);

  const items = markerQuery.data?.items ?? [];

  const properties = useMemo(
    () => (listQuery.data?.items ?? []).filter(isPropertyPin),
    [listQuery.data?.items],
  );

  const mapVisibleCount = useMemo(
    () => countVisibleMapProperties(items),
    [items],
  );

  // Sheet list is the product source of truth; fall back to map presence
  // while the unclustered list has not arrived yet.
  const visibleCount =
    properties.length > 0 ? properties.length : mapVisibleCount;

  const error =
    markerQuery.error ?? listQuery.error;

  return {
    items,
    properties,
    visibleCount,
    loading: markerQuery.isFetching || listQuery.isFetching,
    error: error
      ? error instanceof Error
        ? error.message
        : "No pudimos cargar el mapa"
      : null,
    reload,
  };
}
