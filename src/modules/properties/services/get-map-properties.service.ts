import {
  mapMapResultRow,
} from "../mappers/property-map.mapper";

import {
  getMapPropertiesRepository,
} from "../repositories/property-read.repository";

import {
  MapViewportQuery,
} from "../types/property-map.types";

type Options = {
  forAgentDiscovery?: boolean;
};

export async function getMapPropertiesService(
  input: MapViewportQuery,
  options: Options = {},
) {
  const rows = await getMapPropertiesRepository(input, options);

  return rows.map(mapMapResultRow);
}
