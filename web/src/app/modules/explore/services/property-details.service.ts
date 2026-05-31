import type {
  PropertyDetailsDTO,
} from "../types/property-details.dto";

import {
  mapPropertyDetails,
} from "../mappers/property-details.mapper";
import { API_URL } from "../../../../lib/api-base";

export async function getPropertyById(
  id: string
) {
  const response = await fetch(
    `${API_URL}/properties/${id}`
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
