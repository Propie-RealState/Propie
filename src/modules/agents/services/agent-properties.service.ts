import { getAgentCommercializedPropertiesRepository } from "../repositories/get-agent-commercialized-properties.repository";
import { getOwnerPublishedPropertiesRepository } from "../repositories/get-owner-published-properties.repository";

export async function getCommercializedPropertiesService(agentId: string) {
  return getAgentCommercializedPropertiesRepository(agentId);
}

export async function getPublishedPropertiesService(userId: string) {
  return getOwnerPublishedPropertiesRepository(userId);
}
