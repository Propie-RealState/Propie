import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { cancelVisitService } from "@/modules/property-visits/services/cancel-visit.service";
import { completeVisitService } from "@/modules/property-visits/services/complete-visit.service";
import { confirmVisitService } from "@/modules/property-visits/services/confirm-visit.service";
import { createVisitService } from "@/modules/property-visits/services/create-visit.service";
import { getVisitService } from "@/modules/property-visits/services/get-visit.service";
import { listVisitsService } from "@/modules/property-visits/services/list-visits.service";
import { rescheduleVisitService } from "@/modules/property-visits/services/reschedule-visit.service";
import { db } from "@/database/client";
import {
  cleanupFixture,
  seedConversationFixture,
  type ConversationFixture,
} from "../helpers/test-db";
import { ensureVisitSchema } from "../helpers/ensure-visit-schema";

function futureDate(daysAhead = 3) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

describe("visit lifecycle", () => {
  let fixture: ConversationFixture;

  beforeAll(async () => {
    await ensureVisitSchema();
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
  });

  it("agent creates visit from conversation", async () => {
    const visit = await createVisitService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(5),
      durationMinutes: 45,
      notes: "Primera visita",
    });

    expect(visit.propertyId).toBe(fixture.propertyId);
    expect(visit.clientId).toBe(fixture.clientId);
    expect(visit.agentId).toBe(fixture.agentId);
    expect(visit.status).toBe("SCHEDULED");
    expect(visit.durationMinutes).toBe(45);
  });

  it("posts system message in conversation on create", async () => {
    const visit = await createVisitService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(6),
      durationMinutes: 30,
    });

    const messages = await db.query<{ content_type: string; body: string }>(
      `
        SELECT content_type, body
        FROM property_conversation_messages
        WHERE conversation_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [fixture.conversationId],
    );

    expect(messages.rows[0]?.content_type).toBe("SYSTEM");
    expect(messages.rows[0]?.body.toLowerCase()).toContain("visita");
    expect(visit.id).toBeTruthy();
  });

  it("client confirms visit", async () => {
    const visit = await createVisitService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(7),
      durationMinutes: 30,
    });

    const confirmed = await confirmVisitService({
      userId: fixture.clientId,
      visitId: visit.id,
    });

    expect(confirmed.status).toBe("CONFIRMED");
  });

  it("agent reschedules visit", async () => {
    const visit = await createVisitService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(8),
      durationMinutes: 30,
    });

    const newTime = futureDate(9);
    const rescheduled = await rescheduleVisitService({
      userId: fixture.agentId,
      visitId: visit.id,
      scheduledAt: newTime,
      durationMinutes: 60,
    });

    expect(rescheduled.status).toBe("RESCHEDULED");
    expect(new Date(rescheduled.scheduledAt).getTime()).toBe(
      new Date(newTime).getTime(),
    );
    expect(rescheduled.durationMinutes).toBe(60);
  });

  it("agent completes visit", async () => {
    const visit = await createVisitService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(10),
      durationMinutes: 30,
    });

    await confirmVisitService({
      userId: fixture.agentId,
      visitId: visit.id,
    });

    const completed = await completeVisitService({
      userId: fixture.agentId,
      visitId: visit.id,
    });

    expect(completed.status).toBe("COMPLETED");
  });

  it("client can cancel visit", async () => {
    const visit = await createVisitService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(11),
      durationMinutes: 30,
    });

    const cancelled = await cancelVisitService({
      userId: fixture.clientId,
      visitId: visit.id,
      reason: "No puedo asistir",
    });

    expect(cancelled.status).toBe("CANCELLED");
  });

  it("owner can view visits for owned property", async () => {
    await createVisitService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(12),
      durationMinutes: 30,
    });

    const visits = await listVisitsService({
      userId: fixture.ownerId,
      segment: "upcoming",
    });

    expect(visits.length).toBeGreaterThan(0);
  });

  it("stranger cannot access visit", async () => {
    const visit = await createVisitService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(13),
      durationMinutes: 30,
    });

    await expect(
      getVisitService({
        userId: fixture.strangerId,
        visitId: visit.id,
      }),
    ).rejects.toThrow("FORBIDDEN");
  });

  it("owner creates visit from conversation", async () => {
    const visit = await createVisitService({
      userId: fixture.ownerId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(15),
      durationMinutes: 30,
      notes: "Visita agendada por dueño",
    });

    expect(visit.propertyId).toBe(fixture.propertyId);
    expect(visit.clientId).toBe(fixture.clientId);
    expect(visit.agentId).toBe(fixture.agentId);
    expect(visit.status).toBe("SCHEDULED");
  });

  it("owner can reschedule and complete visit", async () => {
    const visit = await createVisitService({
      userId: fixture.ownerId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(16),
      durationMinutes: 30,
    });

    const rescheduled = await rescheduleVisitService({
      userId: fixture.ownerId,
      visitId: visit.id,
      scheduledAt: futureDate(17),
      durationMinutes: 45,
    });

    expect(rescheduled.status).toBe("RESCHEDULED");

    await confirmVisitService({
      userId: fixture.ownerId,
      visitId: visit.id,
    });

    const completed = await completeVisitService({
      userId: fixture.ownerId,
      visitId: visit.id,
    });

    expect(completed.status).toBe("COMPLETED");
  });

  it("client cannot create visit", async () => {
    await expect(
      createVisitService({
        userId: fixture.clientId,
        conversationId: fixture.conversationId,
        scheduledAt: futureDate(14),
        durationMinutes: 30,
      }),
    ).rejects.toThrow("FORBIDDEN");
  });
});
