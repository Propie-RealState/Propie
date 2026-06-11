import { listConversationsForUserRepository } from "../repositories/property-conversations.repository";
import { mapConversationListRow } from "../utils/map-conversation";

export async function listConversationsService(input: {
  userId: string;
}) {
  const rows = await listConversationsForUserRepository(input.userId);

  return rows.map(mapConversationListRow);
}
