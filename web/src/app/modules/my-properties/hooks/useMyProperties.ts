import { useQuery } from "@tanstack/react-query";

import type { OwnedProperty } from "../types/my-properties.types";
import { getMyProperties } from "../services/my-properties.service";
import { propertyQueryKeys } from "../../properties/cache/property-query-cache";

interface UseMyPropertiesResult {
  properties: OwnedProperty[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMyProperties(): UseMyPropertiesResult {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: propertyQueryKeys.mine,
    queryFn: ({ signal }) => getMyProperties(signal),
  });

  return {
    properties: data ?? [],
    loading: isFetching,
    error: error
      ? error instanceof Error
        ? error.message
        : "Error desconocido"
      : null,
    refetch: () => {
      void refetch();
    },
  };
}
