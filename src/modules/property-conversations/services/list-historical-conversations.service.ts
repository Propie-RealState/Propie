import {
  listHistoricalConversationsRepository,
  listAllConversationsRepository,
} from "../repositories/property-conversations.repository";
import { mapConversationRow, mapConversationListRow } from "../utils/map-conversation";
import { canAdminRead } from "@/utils/authorization";

export async function listHistoricalConversationsService(input: {
  userId: string;
  userRole: string;
}) {
  if (canAdminRead(input.userRole)) {
    const rows = await listAllConversationsRepository();
    return rows.map((row) => mapConversationListRow(row, input.userId));
  }

  const rows = await listHistoricalConversationsRepository(input.userId);

  return rows.map((row) => ({
    ...mapConversationRow(row),
    readOnly: true,
  }));
}
