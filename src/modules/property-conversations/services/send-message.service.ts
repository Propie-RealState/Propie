import { db } from "@/database/client";

import { canSendMessage } from "../repositories/can-access-conversation.repository";
import {
  incrementUnreadCountsForRecipients,
  listActiveNotificationRecipientIds,
} from "../repositories/participant-states.repository";
import { getConversationContext } from "../repositories/participants.repository";
import {
  insertConversationMessage,
  updateConversationLastMessage,
} from "../repositories/messages.repository";
import { mapMessageRow } from "../utils/map-message";
import { notifyPropertyConversationMessage } from "@/modules/notifications/services/notification-dispatch.service";

type SenderInfo = {
  id: string;
  role: "CLIENT" | "OWNER" | "AGENT";
  displayName: string;
};

async function getSenderInfo(userId: string): Promise<SenderInfo | null> {
  const result = await db.query<{
    id: string;
    role: "CLIENT" | "OWNER" | "AGENT";
    first_name: string;
    last_name: string;
  }>(
    `
      SELECT id, role, first_name, last_name
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const displayName =
    `${row.first_name} ${row.last_name}`.trim() || "Usuario";

  return {
    id: row.id,
    role: row.role,
    displayName,
  };
}

function buildMessagePreview(body: string) {
  const trimmed = body.trim();

  if (trimmed.length <= 120) {
    return trimmed;
  }

  return `${trimmed.slice(0, 117)}...`;
}

export async function sendMessageService(input: {
  userId: string;
  conversationId: string;
  body: string;
}) {
  const trimmedBody = input.body.trim();

  if (!trimmedBody) {
    throw new Error("EMPTY_MESSAGE");
  }

  const allowed = await canSendMessage({
    userId: input.userId,
    conversationId: input.conversationId,
  });

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  const sender = await getSenderInfo(input.userId);

  if (!sender) {
    throw new Error("FORBIDDEN");
  }

  const context = await getConversationContext(input.conversationId);

  if (!context) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const message = await insertConversationMessage(
      {
        conversationId: input.conversationId,
        senderId: sender.id,
        senderRole: sender.role,
        body: trimmedBody,
      },
      client,
    );

    await updateConversationLastMessage(
      {
        conversationId: input.conversationId,
        preview: buildMessagePreview(trimmedBody),
      },
      client,
    );

    await incrementUnreadCountsForRecipients(
      {
        conversationId: input.conversationId,
        senderId: sender.id,
      },
      client,
    );

    await client.query("COMMIT");

    const recipientUserIds = await listActiveNotificationRecipientIds(
      input.conversationId,
      sender.id,
    );

    if (recipientUserIds.length > 0) {
      await notifyPropertyConversationMessage({
        conversationId: input.conversationId,
        propertyId: context.propertyId,
        senderName: sender.displayName,
        preview: buildMessagePreview(trimmedBody),
        recipientUserIds,
      });
    }

    return mapMessageRow(message);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
