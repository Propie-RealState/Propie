import {
  notifyVisitReminder,
} from "@/modules/notifications/services/notification-dispatch.service";

import {
  findDueVisitRemindersRepository,
  markVisitReminderSentRepository,
} from "../repositories/visit-reminders.repository";
import { findVisitByIdRepository } from "../repositories/visits.repository";

const REMINDABLE_STATUSES = new Set([
  "SCHEDULED",
  "CONFIRMED",
  "RESCHEDULED",
]);

export async function processVisitRemindersService() {
  const dueReminders = await findDueVisitRemindersRepository();
  const processed: string[] = [];

  for (const reminder of dueReminders) {
    const visit = await findVisitByIdRepository(reminder.visit_id);

    if (!visit || !REMINDABLE_STATUSES.has(visit.status)) {
      await markVisitReminderSentRepository(reminder.id);
      continue;
    }

    await notifyVisitReminder({
      visitId: visit.id,
      propertyId: visit.property_id,
      clientId: visit.client_id,
      agentId: visit.agent_id,
      conversationId: visit.conversation_id,
      scheduledAt: visit.scheduled_at,
      offsetMinutes: reminder.offset_minutes,
    });

    await markVisitReminderSentRepository(reminder.id);
    processed.push(reminder.id);
  }

  return {
    processedCount: processed.length,
    reminderIds: processed,
  };
}
