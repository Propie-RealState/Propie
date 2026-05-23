import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getMapProperties } from "../services/map.service";
import { useMapStore } from "../stores/useMapStore";
import type { MapResult } from "../types/map.types";
import { useDebouncedValue } from "./useDebouncedValue";

export function useMapProperties() {
  const bounds =
    useMapStore((state) => state.bounds);
  const zoom =
    useMapStore((state) => state.viewport.zoom);
  const filters =
    useMapStore((state) => state.filters);
  const setHasMovedSinceSearch =
    useMapStore((state) => state.setHasMovedSinceSearch);

  const [items, setItems] =
    useState<MapResult[]>([]);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [refreshKey, setRefreshKey] =
    useState(0);

  const requestInput =
    useMemo(
      () => ({
        bounds,
        zoom:
          Math.round(zoom * 10) / 10,
        filters,
        refreshKey,
      }),
      [
        bounds,
        filters,
        refreshKey,
        zoom,
      ],
    );

  const debouncedInput =
    useDebouncedValue(
      requestInput,
      320
    );

  const abortRef =
    useRef<AbortController | null>(null);

  const reload =
    useCallback(() => {
      setRefreshKey((value) => value + 1);
      setHasMovedSinceSearch(false);
    }, [setHasMovedSinceSearch]);

  useEffect(() => {
    if (!debouncedInput.bounds) {
      return;
    }

    abortRef.current?.abort();

    const controller =
      new AbortController();

    abortRef.current =
      controller;

    setLoading(true);
    setError(null);

    getMapProperties({
      bounds:
        debouncedInput.bounds,
      zoom:
        debouncedInput.zoom,
      filters:
        debouncedInput.filters,
      signal:
        controller.signal,
    })
      .then((response) => {
        setItems(response.items);
        setHasMovedSinceSearch(false);
      })
      .catch((requestError) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "No pudimos cargar el mapa"
        );
      })
      .finally(() => {
        if (
          abortRef.current === controller
        ) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    debouncedInput,
    setHasMovedSinceSearch,
  ]);

  const properties =
    useMemo(
      () =>
        items.filter(
          (item): item is Extract<MapResult, { type: "property" }> =>
            item.type === "property"
        ),
      [items],
    );

  return {
    items,
    properties,
    loading,
    error,
    reload,
  };
}
