import { useQuery } from "@tanstack/react-query";

import type { OwnedProperty } from "../types/my-properties.types";
import { getMyProperties } from "../services/my-properties.service";

interface UseMyPropertiesResult {
  properties: OwnedProperty[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMyProperties(): UseMyPropertiesResult {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["properties", "mine"],
    queryFn: getMyProperties,
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
