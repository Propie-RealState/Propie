import { getPropertiesRepository } from "../repositories/property-read.repository";

type Options = {
  forAgentDiscovery?: boolean;
  limit?: number;
  offset?: number;
};

export async function getPropertiesService(options: Options = {}) {
  return getPropertiesRepository(options);
}
