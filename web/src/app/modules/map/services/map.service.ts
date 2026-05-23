import type {
  MapBounds,
  MapFilters,
  NearbyPropertiesResponse,
  PropertiesMapResponse,
} from "../types/map.types";

const API_BASE =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

function appendFilters(
  params: URLSearchParams,
  filters: MapFilters
) {
  if (filters.operationType) {
    params.set(
      "operationType",
      filters.operationType
    );
  }

  if (filters.propertyType) {
    params.set(
      "propertyType",
      filters.propertyType
    );
  }

  if (filters.minPrice !== undefined) {
    params.set(
      "minPrice",
      String(filters.minPrice)
    );
  }

  if (filters.maxPrice !== undefined) {
    params.set(
      "maxPrice",
      String(filters.maxPrice)
    );
  }
}

export async function getMapProperties(
  input: {
    bounds: MapBounds;
    zoom: number;
    filters: MapFilters;
    signal?: AbortSignal;
  }
): Promise<PropertiesMapResponse> {
  const params =
    new URLSearchParams({
      nelat:
        String(input.bounds.nelat),
      nelng:
        String(input.bounds.nelng),
      swlat:
        String(input.bounds.swlat),
      swlng:
        String(input.bounds.swlng),
      zoom:
        String(input.zoom),
    });

  appendFilters(
    params,
    input.filters
  );

  const response =
    await fetch(
      `${API_BASE}/properties/map?${params.toString()}`,
      {
        signal:
          input.signal,
      }
    );

  if (!response.ok) {
    throw new Error(
      "No pudimos cargar el mapa"
    );
  }

  return response.json();
}

export async function getNearbyProperties(
  input: {
    lat: number;
    lng: number;
    radius: number;
    filters: MapFilters;
    signal?: AbortSignal;
  }
): Promise<NearbyPropertiesResponse> {
  const params =
    new URLSearchParams({
      lat:
        String(input.lat),
      lng:
        String(input.lng),
      radius:
        String(input.radius),
    });

  appendFilters(
    params,
    input.filters
  );

  const response =
    await fetch(
      `${API_BASE}/properties/nearby?${params.toString()}`,
      {
        signal:
          input.signal,
      }
    );

  if (!response.ok) {
    throw new Error(
      "No pudimos cargar propiedades cercanas"
    );
  }

  return response.json();
}
