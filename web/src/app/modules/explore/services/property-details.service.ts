import type {
  PropertyDetailsDTO,
} from "../types/property-details.dto";

import {
  mapPropertyDetails,
} from "../mappers/property-details.mapper";

const API_BASE =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

export async function getPropertyById(
  id: string
) {
  const response = await fetch(
    `${API_BASE}/properties/${id}`
  );

  if (!response.ok) {
    throw new Error(
      "Error obteniendo propiedad"
    );
  }

  const data: PropertyDetailsDTO =
    await response.json();

  return mapPropertyDetails(data);
}