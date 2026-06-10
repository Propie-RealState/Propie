import { listConversationsForUserRepository } from "../repositories/property-conversations.repository";
import { mapConversationRow } from "../utils/map-conversation";

export async function listConversationsService(input: {
  userId: string;
}) {
  const rows = await listConversationsForUserRepository(input.userId);

  return rows.map(mapConversationRow);
}
