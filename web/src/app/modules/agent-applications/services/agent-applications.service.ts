import { apiFetch } from "../../../../lib/api";

export type AgentApplicationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export type OwnerAgentApplication = {
  id: string;
  property_id: string;
  agent_id: string;
  message: string | null;
  status: AgentApplicationStatus;
  created_at: string;
  updated_at: string;
  property_title: string | null;
  property_price: string | null;
  property_operation_type: string | null;
  property_city: string | null;
  property_neighborhood: string | null;
  property_address: string | null;
  agent_email: string;
  agent_first_name: string | null;
  agent_last_name: string | null;
  agent_phone: string | null;
  agent_avatar_url: string | null;
};

export type AgentApplication = {
  id: string;
  property_id: string;
  agent_id: string;
  message: string | null;
  status: AgentApplicationStatus;
  created_at: string;
  updated_at: string;
};

export async function sendAgentApplication(input: {
  propertyId: string;
  message: string;
}) {
  return apiFetch("/agent-applications", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOwnerAgentApplications() {
  const response = await apiFetch("/agent-applications/owner");

  return (response.data ?? []) as OwnerAgentApplication[];
}

export async function getOwnerAgentApplicationsCount() {
  const response = await apiFetch("/agent-applications/owner/count");

  return Number(response.data?.count ?? 0);
}

export async function getMyAgentApplicationByProperty(propertyId: string) {
  const response = await apiFetch(
    `/agent-applications/mine/property/${propertyId}`,
  );

  return response.data as AgentApplication | null;
}

export async function updateOwnerAgentApplicationStatus(
  applicationId: string,
  status: "ACCEPTED" | "REJECTED",
) {
  return apiFetch(`/agent-applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  });
}
