import { db } from "@/database/client";

import { notifyPropertyConversationMessage } from "@/modules/notifications/services/notification-dispatch.service";

import { canSendMessage } from "../repositories/can-access-conversation.repository";
import {
  incrementUnreadCountsForRecipients,
  listActiveNotificationRecipientIds,
} from "../repositories/participant-states.repository";
import { getConversationContext } from "../repositories/participants.repository";
import {
  findConversationByIdRepository,
  getPropertyChatGate,
} from "../repositories/property-conversations.repository";
import {
  insertConversationMessage,
  insertSystemConversationMessage,
  updateConversationLastMessage,
} from "../repositories/messages.repository";
import type { MessageContentType } from "../types/property-conversation.types";
import type { PropertyConversationMessageRow } from "@/database/types/property-conversations";
import { mapMessageRow } from "../utils/map-message";
import { assertOpenConversationForMessaging } from "../utils/conversation-status-transitions";

function buildMessagePreview(body: string) {
  const trimmed = body.trim();

  if (trimmed.length <= 120) {
    return trimmed;
  }

  return `${trimmed.slice(0, 117)}...`;
}

export type AppendConversationEventInput = {
  conversationId: string;
  senderId: string;
  senderRole: "CLIENT" | "OWNER" | "AGENT";
  body: string;
  contentType: MessageContentType;
  metadata?: Record<string, unknown>;
  senderDisplayName?: string;
};

export async function appendConversationEvent(
  input: AppendConversationEventInput,
) {
  const trimmedBody = input.body.trim();

  if (!trimmedBody) {
    throw new Error("EMPTY_MESSAGE");
  }

  const allowed = await canSendMessage({
    userId: input.senderId,
    conversationId: input.conversationId,
  });

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  const conversation = await findConversationByIdRepository(
    input.conversationId,
  );

  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  assertOpenConversationForMessaging(conversation.status);

  const gate = await getPropertyChatGate(conversation.property_id);

  if (!gate?.allowChat) {
    throw new Error("CHAT_DISABLED");
  }

  const context = await getConversationContext(input.conversationId);

  if (!context) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  const preview = buildMessagePreview(trimmedBody);
  const client = await db.connect();

  let message: PropertyConversationMessageRow;

  try {
    await client.query("BEGIN");

    message = input.contentType === "SYSTEM"
      ? await insertSystemConversationMessage(
          {
            conversationId: input.conversationId,
            senderId: input.senderId,
            senderRole: input.senderRole,
            body: trimmedBody,
            metadata: input.metadata,
          },
          client,
        )
      : await insertConversationMessage(
          {
            conversationId: input.conversationId,
            senderId: input.senderId,
            senderRole: input.senderRole,
            body: trimmedBody,
          },
          client,
        );

    await updateConversationLastMessage(
      {
        conversationId: input.conversationId,
        preview,
      },
      client,
    );

    await incrementUnreadCountsForRecipients(
      {
        conversationId: input.conversationId,
        senderId: input.senderId,
      },
      client,
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  if (
    input.contentType === "TEXT"
    && input.senderDisplayName
  ) {
    const recipientUserIds = await listActiveNotificationRecipientIds(
      input.conversationId,
      input.senderId,
    );

    if (recipientUserIds.length > 0) {
      await notifyPropertyConversationMessage({
        conversationId: input.conversationId,
        propertyId: context.propertyId,
        senderName: input.senderDisplayName,
        preview,
        recipientUserIds,
      });
    }
  }

  return mapMessageRow(message);
}
