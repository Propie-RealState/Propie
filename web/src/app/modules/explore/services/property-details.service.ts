import type {
  PropertyDetailsDTO,
} from "../types/property-details.dto";

import {
  mapPropertyDetails,
} from "../mappers/property-details.mapper";
import { apiFetch } from "../../../../lib/api";

export async function getPropertyById(id: string) {
  const data = await apiFetch<PropertyDetailsDTO>(`/properties/${id}`);
  return mapPropertyDetails(data);
}
