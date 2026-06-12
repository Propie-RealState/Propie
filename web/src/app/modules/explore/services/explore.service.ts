import type { PropertyDTO } from "../types/property.dto";
import type { Property } from "../types/property.types";

import { mapPropertyDtoToProperty } from "../mappers/property.mapper";
import { apiFetch } from "../../../../lib/api";

export async function getPublishedProperties(): Promise<Property[]> {
  const data = await apiFetch<PropertyDTO[]>("/properties");

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
