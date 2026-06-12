import { db } from "@/database/client";

import { canAccessConversation } from "@/modules/property-conversations/repositories/can-access-conversation.repository";
import { findConversationByIdRepository } from "@/modules/property-conversations/repositories/property-conversations.repository";
import {
  getConversationContext,
  getActiveAgentIdsForProperty,
  isActiveAgentOnProperty,
} from "@/modules/property-conversations/repositories/participants.repository";
import {
  notifyVisitCreated,
} from "@/modules/notifications/services/notification-dispatch.service";

import { insertVisitEventRepository } from "../repositories/visit-events.repository";
import {
  insertVisitRemindersRepository,
} from "../repositories/visit-reminders.repository";
import {
  insertVisitRepository,
} from "../repositories/visits.repository";
import type { VisitActorRole } from "../types/visit.types";
import { VISIT_REMINDER_OFFSETS_MINUTES } from "../types/visit.types";
import { mapVisitRow } from "../utils/map-visit";
import { postVisitSystemMessageService } from "./post-visit-system-message.service";
import { getPropertyByIdRepository } from "@/modules/properties/repositories/get-property-by-id.repository";
import { PROPERTY_STATUSES } from "@/modules/properties/constants/property-status.constants";

async function getUserRole(userId: string) {
  const result = await db.query<{ role: string }>(
    `
      SELECT role
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0]?.role ?? null;
}

async function resolveVisitAgentId(input: {
  schedulerRole: "AGENT" | "OWNER";
  schedulerId: string;
  conversationId: string;
  propertyId: string;
}) {
  if (input.schedulerRole === "AGENT") {
    return input.schedulerId;
  }

  const conversation = await findConversationByIdRepository(
    input.conversationId,
  );

  if (conversation?.assigned_agent_id) {
    const isActive = await isActiveAgentOnProperty(
      conversation.assigned_agent_id,
      input.propertyId,
    );

    if (isActive) {
      return conversation.assigned_agent_id;
    }
  }

  const activeAgentIds = await getActiveAgentIdsForProperty(input.propertyId);

  return activeAgentIds[0] ?? null;
}

export async function createVisitService(input: {
  userId: string;
  conversationId: string;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
}) {
  const role = await getUserRole(input.userId);

  if (role !== "AGENT" && role !== "OWNER") {
    throw new Error("FORBIDDEN");
  }

  const allowed = await canAccessConversation({
    userId: input.userId,
    conversationId: input.conversationId,
  });

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  const context = await getConversationContext(input.conversationId);

  if (!context || !context.clientId) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  if (context.conversationType !== "PROPERTY_CLIENT") {
    throw new Error("FORBIDDEN");
  }

  const property = await getPropertyByIdRepository(context.propertyId);

  if (
    !property?.published_at ||
    property.status !== PROPERTY_STATUSES.ACTIVE
  ) {
    throw new Error("PROPERTY_NOT_AVAILABLE");
  }

  const schedulerRole = role as "AGENT" | "OWNER";
  const actorRole: VisitActorRole = schedulerRole;

  if (schedulerRole === "AGENT") {
    const agentIsActive = await isActiveAgentOnProperty(
      input.userId,
      context.propertyId,
    );

    if (!agentIsActive) {
      throw new Error("AGENT_NOT_ACTIVE");
    }
  } else if (context.ownerId !== input.userId) {
    throw new Error("FORBIDDEN");
  }

  const scheduledAtMs = new Date(input.scheduledAt).getTime();

  if (Number.isNaN(scheduledAtMs) || scheduledAtMs <= Date.now()) {
    throw new Error("INVALID_SCHEDULED_AT");
  }

  const visitAgentId = await resolveVisitAgentId({
    schedulerRole,
    schedulerId: input.userId,
    conversationId: input.conversationId,
    propertyId: context.propertyId,
  });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const visit = await insertVisitRepository(
      {
        propertyId: context.propertyId,
        conversationId: input.conversationId,
        clientId: context.clientId,
        agentId: visitAgentId,
        createdBy: input.userId,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
        notes: input.notes?.trim() || null,
      },
      client,
    );

    await insertVisitEventRepository(
      {
        visitId: visit.id,
        actorId: input.userId,
        actorRole,
        eventType: "CREATED",
        payload: {
          scheduledAt: input.scheduledAt,
          durationMinutes: input.durationMinutes,
        },
      },
      client,
    );

    await insertVisitRemindersRepository(
      {
        visitId: visit.id,
        scheduledAt: input.scheduledAt,
        offsetsMinutes: VISIT_REMINDER_OFFSETS_MINUTES,
      },
      client,
    );

    await client.query("COMMIT");

    await postVisitSystemMessageService({
      visit,
      actorId: input.userId,
      actorRole,
      event: "created",
    });

    await notifyVisitCreated({
      visitId: visit.id,
      propertyId: visit.property_id,
      clientId: visit.client_id,
      agentId: visit.agent_id,
      conversationId: visit.conversation_id,
      scheduledAt: visit.scheduled_at,
    });

    return mapVisitRow(visit);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
