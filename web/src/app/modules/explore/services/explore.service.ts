import type { PropertyDTO } from "../types/property.dto";
import type { Property } from "../types/property.types";

import { mapPropertyDtoToProperty } from "../mappers/property.mapper";
import { API_URL } from "../../../../lib/api-base";

export async function getPublishedProperties(): Promise<Property[]> {
  const response = await fetch(
    `${API_URL}/properties`
  );

  if (!response.ok) {
    throw new Error(
      "Error obteniendo propiedades"
    );
  }

  const data: PropertyDTO[] =
    await response.json();

  const properties = data.map(mapPropertyDtoToProperty);
  const seen = new Set<string>();

  return properties.filter((property) => {
    if (seen.has(property.id)) {
      return false;
    }

    seen.add(property.id);
    return true;
  });
}
