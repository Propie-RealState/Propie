import { useEffect, useState } from "react";
import type { OwnedProperty } from "../types/my-properties.types";
import { getMyProperties } from "../services/my-properties.service";

interface UseMyPropertiesResult {
  properties: OwnedProperty[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMyProperties(): UseMyPropertiesResult {
  const [properties, setProperties] = useState<OwnedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
  };
}
