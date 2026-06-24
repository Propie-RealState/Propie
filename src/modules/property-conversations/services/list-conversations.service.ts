import {
  listConversationsForUserRepository,
  listAllConversationsRepository,
} from "../repositories/property-conversations.repository";
import { mapConversationListRow } from "../utils/map-conversation";
import { canAdminRead } from "@/utils/authorization";

export async function listConversationsService(input: {
  userId: string;
  userRole: string;
}) {
  if (canAdminRead(input.userRole)) {
    const rows = await listAllConversationsRepository();
    return rows.map((row) => mapConversationListRow(row, input.userId));
  }

  const rows = await listConversationsForUserRepository(input.userId);
  return rows.map((row) => mapConversationListRow(row, input.userId));
}
