import { listHistoricalConversationsRepository } from "../repositories/property-conversations.repository";
import { mapConversationRow } from "../utils/map-conversation";

export async function listHistoricalConversationsService(input: {
  userId: string;
}) {
  const rows = await listHistoricalConversationsRepository(input.userId);

  return rows.map((row) => ({
    ...mapConversationRow(row),
    readOnly: true,
  }));
}
