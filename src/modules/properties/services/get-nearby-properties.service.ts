import {
  mapPropertyPinRow,
} from "../mappers/property-map.mapper";

import {
  getNearbyPropertiesRepository,
} from "../repositories/get-nearby-properties.repository";

import {
  NearbyPropertiesQuery,
} from "../types/property-map.types";

export async function getNearbyPropertiesService(
  input: NearbyPropertiesQuery
) {
  const rows =
    await getNearbyPropertiesRepository(
      input
    );

  return rows.map(mapPropertyPinRow);
}
