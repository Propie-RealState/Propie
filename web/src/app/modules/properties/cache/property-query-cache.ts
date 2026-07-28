import type { QueryClient } from "@tanstack/react-query";

import type { GlobalSearchResponse } from "../../explore/types/global-search.types";
import type { Property } from "../../explore/types/property.types";
import type { OwnedProperty } from "../../my-properties/types/my-properties.types";
import type { PropertiesMapResponse } from "../../map/types/map.types";

/**
 * Canonical React Query keys for property inventory surfaces.
 * Soft-delete cache sync must touch every prefix listed here.
 */
export const propertyQueryKeys = {
  /** Explore + Favorites shared listing */
  published: ["published-properties"] as const,
  mine: ["properties", "mine"] as const,
  search: ["search"] as const,
  map: ["map"] as const,
} as const;

/** @deprecated Prefer propertyQueryKeys.published */
export const publishedPropertiesKey = propertyQueryKeys.published;

/**
 * Immediately sync all property inventory caches after a successful soft delete.
 *
 * Strategy:
 * 1. Cancel in-flight inventory fetches so late responses cannot resurrect the card.
 * 2. Optimistically remove the id from known list-shaped caches (instant UI).
 * 3. Invalidate prefixes so mounted/background observers refetch from the API.
 *
 * Do not rely on staleTime expiry or a full page reload.
 */
export async function syncCachesAfterPropertySoftDelete(
  queryClient: QueryClient,
  propertyId: string,
): Promise<void> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: propertyQueryKeys.published }),
    queryClient.cancelQueries({ queryKey: propertyQueryKeys.mine }),
    queryClient.cancelQueries({ queryKey: propertyQueryKeys.search }),
    queryClient.cancelQueries({ queryKey: propertyQueryKeys.map }),
  ]);

  queryClient.setQueryData<Property[]>(
    propertyQueryKeys.published,
    (previous) => previous?.filter((property) => property.id !== propertyId),
  );

  queryClient.setQueryData<OwnedProperty[]>(
    propertyQueryKeys.mine,
    (previous) => previous?.filter((property) => property.id !== propertyId),
  );

  queryClient.setQueriesData<GlobalSearchResponse>(
    { queryKey: propertyQueryKeys.search },
    (previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        properties: previous.properties.filter(
          (property) => property.id !== propertyId,
        ),
      };
    },
  );

  queryClient.setQueriesData<PropertiesMapResponse>(
    { queryKey: propertyQueryKeys.map },
    (previous) => {
      if (!previous?.items) {
        return previous;
      }

      return {
        ...previous,
        items: previous.items.filter(
          (item) => item.type !== "property" || item.id !== propertyId,
        ),
      };
    },
  );

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: propertyQueryKeys.published }),
    queryClient.invalidateQueries({ queryKey: propertyQueryKeys.mine }),
    queryClient.invalidateQueries({ queryKey: propertyQueryKeys.search }),
    queryClient.invalidateQueries({ queryKey: propertyQueryKeys.map }),
  ]);
}
