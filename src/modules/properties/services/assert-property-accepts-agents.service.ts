import { getPropertyCommercializationModeRepository } from "../repositories/property-commercialization.repository";
import { isAgentParticipationAllowed } from "../constants/commercialization-mode.constants";

export class PropertyAgentParticipationBlockedError extends Error {
  constructor(message = "Esta propiedad no acepta participación de agentes") {
    super(message);
    this.name = "PropertyAgentParticipationBlockedError";
  }
}

export async function assertPropertyAcceptsAgents(
  propertyId: string,
): Promise<void> {
  const mode = await getPropertyCommercializationModeRepository(propertyId);

  if (!isAgentParticipationAllowed(mode)) {
    throw new PropertyAgentParticipationBlockedError();
  }
}

export async function propertyAcceptsAgentParticipation(
  propertyId: string,
): Promise<boolean> {
  const mode = await getPropertyCommercializationModeRepository(propertyId);
  return isAgentParticipationAllowed(mode);
}
