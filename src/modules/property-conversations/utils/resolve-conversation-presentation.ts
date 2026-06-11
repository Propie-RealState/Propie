import type { ParticipantRole } from "../types/property-conversation.types";

export type ConversationPresentation = {
  propertyTitle: string;
  inboxRoleLabel: string;
  inboxSubtitle: string;
  headerParticipantRole: ParticipantRole;
  headerParticipantName: string;
  headerParticipantIsOnline: boolean;
};

type PresentationInput = {
  conversationType: "PROPERTY_CLIENT" | "PROPERTY_INTERNAL";
  propertyTitle: string;
  viewerUserId: string;
  ownerId: string;
  clientId: string | null;
  internalAgentId: string | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  clientFirstName: string | null;
  clientLastName: string | null;
  internalAgentFirstName: string | null;
  internalAgentLastName: string | null;
};

function formatName(
  firstName: string | null,
  lastName: string | null,
  fallback = "Usuario",
) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
}

export function resolveConversationPresentation(
  input: PresentationInput,
): ConversationPresentation {
  const propertyTitle = input.propertyTitle.trim() || "Propiedad";

  if (input.conversationType === "PROPERTY_CLIENT") {
    const clientName = formatName(
      input.clientFirstName,
      input.clientLastName,
    );

    return {
      propertyTitle,
      inboxRoleLabel: "Cliente",
      inboxSubtitle: "Consulta de propiedad",
      headerParticipantRole: "CLIENT",
      headerParticipantName: clientName,
      headerParticipantIsOnline: false,
    };
  }

  const ownerName = formatName(
    input.ownerFirstName,
    input.ownerLastName,
    "Propietario",
  );
  const agentName = formatName(
    input.internalAgentFirstName,
    input.internalAgentLastName,
    "Agente",
  );

  const viewerIsOwner = input.viewerUserId === input.ownerId;
  const viewerIsAgent = input.viewerUserId === input.internalAgentId;

  if (viewerIsOwner) {
    return {
      propertyTitle,
      inboxRoleLabel: "Agente",
      inboxSubtitle: agentName,
      headerParticipantRole: "AGENT",
      headerParticipantName: agentName,
      headerParticipantIsOnline: false,
    };
  }

  if (viewerIsAgent) {
    return {
      propertyTitle,
      inboxRoleLabel: "Propietario",
      inboxSubtitle: ownerName,
      headerParticipantRole: "OWNER",
      headerParticipantName: ownerName,
      headerParticipantIsOnline: false,
    };
  }

  return {
    propertyTitle,
    inboxRoleLabel: "Agente",
    inboxSubtitle: agentName,
    headerParticipantRole: "AGENT",
    headerParticipantName: agentName,
    headerParticipantIsOnline: false,
  };
}
