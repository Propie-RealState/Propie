import {
  mapMapResultRow,
} from "../mappers/property-map.mapper";

import {
  getMapPropertiesRepository,
} from "../repositories/property-read.repository";

import {
  MapViewportQuery,
} from "../types/property-map.types";

export async function getMapPropertiesService(
  input: MapViewportQuery
) {
  const rows =
    await getMapPropertiesRepository(
      input
    );

  return rows.map(mapMapResultRow);
}
