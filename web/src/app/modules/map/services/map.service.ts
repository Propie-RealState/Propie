import type {
  MapBounds,
  MapFilters,
  NearbyPropertiesResponse,
  PropertiesMapResponse,
} from "../types/map.types";
import { mapPropertyPinDto } from "../mappers/property-pin.mapper";
import { apiFetch } from "../../../../lib/api";

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

  const data = await apiFetch<PropertiesMapResponse>(
    `/properties/map?${params.toString()}`,
    { signal: input.signal },
  );

  return {
    items: data.items.map((item) =>
      item.type === "property"
        ? mapPropertyPinDto(item)
        : item
    ),
  };
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

  return apiFetch<NearbyPropertiesResponse>(
    `/properties/nearby?${params.toString()}`,
    { signal: input.signal },
  );
}
