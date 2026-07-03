import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getPublishedProperties } from "../services/explore.service";
import type { Property } from "../types/property.types";

export const publishedPropertiesKey = ["published-properties"] as const;

/**
 * Shared source of truth for the published-properties listing.
 *
 * Explore and Favorites both consume this, so React Query deduplicates the
 * request, serves a warm cache on navigation between them, and keeps the
 * previous list visible while revalidating in the background.
 */
export function usePublishedProperties() {
  return useQuery<Property[]>({
    queryKey: publishedPropertiesKey,
    queryFn: getPublishedProperties,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    placeholderData: keepPreviousData,
  });
}
