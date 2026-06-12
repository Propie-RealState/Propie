import {
  mapPropertyPinRow,
} from "../mappers/property-map.mapper";

import {
  getNearbyPropertiesRepository,
} from "../repositories/property-read.repository";

import {
  NearbyPropertiesQuery,
} from "../types/property-map.types";

type Options = {
  forAgentDiscovery?: boolean;
};

export async function getNearbyPropertiesService(
  input: NearbyPropertiesQuery,
  options: Options = {},
) {
  const rows = await getNearbyPropertiesRepository(input, options);

  return rows.map(mapPropertyPinRow);
}
