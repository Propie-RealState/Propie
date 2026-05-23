import {
  countPendingOwnerAgentApplicationsRepository,
  createAgentApplicationRepository,
  getAgentApplicationByPropertyRepository,
  getOwnerAgentApplicationsRepository,
  updateOwnerAgentApplicationStatusRepository,
} from "../repositories/agent-applications.repository";

export async function createAgentApplication(input: {
  propertyId: string;
  agentId: string;
  message?: string | null;
}) {
  return createAgentApplicationRepository({
    propertyId: input.propertyId,
    agentId: input.agentId,
    message: input.message?.trim() || null,
  });
}

export async function getOwnerAgentApplications(ownerId: string) {
  return getOwnerAgentApplicationsRepository(ownerId);
}

export async function getAgentApplicationByProperty(input: {
  propertyId: string;
  agentId: string;
}) {
  return getAgentApplicationByPropertyRepository(input);
}

export async function countPendingOwnerAgentApplications(ownerId: string) {
  return countPendingOwnerAgentApplicationsRepository(ownerId);
}

export async function updateOwnerAgentApplicationStatus(input: {
  applicationId: string;
  ownerId: string;
  status: "ACCEPTED" | "REJECTED";
}) {
  return updateOwnerAgentApplicationStatusRepository(input);
}
