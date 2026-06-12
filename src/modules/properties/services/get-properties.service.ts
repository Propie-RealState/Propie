import { getPropertiesRepository } from "../repositories/property-read.repository";

type Options = {
  forAgentDiscovery?: boolean;
};

export async function getPropertiesService(options: Options = {}) {
  return getPropertiesRepository(options);
}
