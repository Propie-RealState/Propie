import type { PropertyDTO } from "../types/property.dto";
import type { Property } from "../types/property.types";

import { mapPropertyDtoToProperty } from "../mappers/property.mapper";

const API_BASE =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000";

export async function getPublishedProperties(): Promise<Property[]> {
  const response = await fetch(
    `${API_BASE}/properties`
  );

  if (!response.ok) {
    throw new Error(
      "Error obteniendo propiedades"
    );
  }

  const data: PropertyDTO[] =
    await response.json();

  return data.map(mapPropertyDtoToProperty);
}