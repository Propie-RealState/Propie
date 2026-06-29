import { db } from "@/database/client";

import { canSendMessage } from "../repositories/can-access-conversation.repository";
import { appendConversationEvent } from "./append-conversation-event.service";

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

  return appendConversationEvent({
    conversationId: input.conversationId,
    senderId: sender.id,
    senderRole: sender.role,
    body: trimmedBody,
    contentType: "TEXT",
    senderDisplayName: sender.displayName,
  });
}
