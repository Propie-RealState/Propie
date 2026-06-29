import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import { cancelVisitService } from "@/modules/property-visits/services/cancel-visit.service";
import { completeVisitService } from "@/modules/property-visits/services/complete-visit.service";
import { confirmVisitService } from "@/modules/property-visits/services/confirm-visit.service";
import { createVisitService } from "@/modules/property-visits/services/create-visit.service";
import { rescheduleVisitService } from "@/modules/property-visits/services/reschedule-visit.service";
import type { VisitStatus } from "@/modules/property-visits/types/visit.types";
import {
  assertVisitStatusTransition,
  getAllowedVisitStatusTransitions,
  VisitStatusTransitionError,
} from "@/modules/property-visits/utils/visit-status-transitions";
import { generateAccessToken } from "@/services/auth/jwt";
import {
  cleanupFixture,
  seedConversationFixture,
  type ConversationFixture,
} from "../helpers/test-db";
import { ensureVisitSchema } from "../helpers/ensure-visit-schema";

const ALL_STATUSES: VisitStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
];

const LEGAL_TRANSITIONS: [VisitStatus, VisitStatus][] = [
  ["SCHEDULED", "CONFIRMED"],
  ["SCHEDULED", "RESCHEDULED"],
  ["SCHEDULED", "COMPLETED"],
  ["SCHEDULED", "CANCELLED"],
  ["CONFIRMED", "RESCHEDULED"],
  ["CONFIRMED", "COMPLETED"],
  ["CONFIRMED", "CANCELLED"],
  ["RESCHEDULED", "CONFIRMED"],
  ["RESCHEDULED", "RESCHEDULED"],
  ["RESCHEDULED", "COMPLETED"],
  ["RESCHEDULED", "CANCELLED"],
];

function futureDate(daysAhead = 5) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

async function insertVisit(input: {
  fixture: ConversationFixture;
  status: VisitStatus;
  scheduledAt?: string;
}) {
  const scheduledAt = input.scheduledAt ?? futureDate(10);
  const result = await db.query<{ id: string }>(
    `
      INSERT INTO property_visits (
        property_id,
        conversation_id,
        client_id,
        agent_id,
        created_by,
        status,
        scheduled_at,
        duration_minutes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 30)
      RETURNING id
    `,
    [
      input.fixture.propertyId,
      input.fixture.conversationId,
      input.fixture.clientId,
      input.fixture.agentId,
      input.fixture.agentId,
      input.status,
      scheduledAt,
    ],
  );

  return result.rows[0].id;
}

describe("visit status transition matrix", () => {
  it("exposes allowed targets per status", () => {
    expect(getAllowedVisitStatusTransitions("SCHEDULED")).toEqual([
      "CONFIRMED",
      "RESCHEDULED",
      "COMPLETED",
      "CANCELLED",
    ]);
    expect(getAllowedVisitStatusTransitions("COMPLETED")).toEqual([]);
    expect(getAllowedVisitStatusTransitions("CANCELLED")).toEqual([]);
  });

  it.each(LEGAL_TRANSITIONS)("allows %s → %s", (from, to) => {
    expect(() => assertVisitStatusTransition(from, to)).not.toThrow();
  });

  it.each(
    ALL_STATUSES.flatMap((from) =>
      ALL_STATUSES.filter((to) => to !== from).map((to) => [from, to] as const),
    ).filter(
      ([from, to]) =>
        !LEGAL_TRANSITIONS.some(([legalFrom, legalTo]) => legalFrom === from && legalTo === to),
    ),
  )("rejects illegal transition %s → %s", (from, to) => {
    expect(() => assertVisitStatusTransition(from, to)).toThrow(
      VisitStatusTransitionError,
    );
  });
});

describe("visit status service transitions", () => {
  let fixture: ConversationFixture;
  const visitIds: string[] = [];

  beforeAll(async () => {
    await ensureVisitSchema();
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    for (const id of visitIds) {
      await db.query(`DELETE FROM property_visit_events WHERE visit_id = $1`, [id]);
      await db.query(`DELETE FROM property_visit_reminders WHERE visit_id = $1`, [id]);
      await db.query(`DELETE FROM property_visits WHERE id = $1`, [id]);
    }
    await cleanupFixture(fixture);
  });

  it("service rejects COMPLETED → CANCELLED", async () => {
    const visitId = await insertVisit({ fixture, status: "COMPLETED" });
    visitIds.push(visitId);

    await expect(
      cancelVisitService({
        userId: fixture.clientId,
        visitId,
        reason: "Too late",
      }),
    ).rejects.toThrow(VisitStatusTransitionError);
  });

  it("service rejects CANCELLED → CONFIRMED", async () => {
    const visitId = await insertVisit({ fixture, status: "CANCELLED" });
    visitIds.push(visitId);

    await expect(
      confirmVisitService({
        userId: fixture.clientId,
        visitId,
      }),
    ).rejects.toThrow(VisitStatusTransitionError);
  });

  it("confirm is idempotent for CONFIRMED visits", async () => {
    const visit = await createVisitService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      scheduledAt: futureDate(12),
      durationMinutes: 30,
    });
    visitIds.push(visit.id);

    await confirmVisitService({
      userId: fixture.clientId,
      visitId: visit.id,
    });

    const eventsBefore = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM property_visit_events WHERE visit_id = $1 AND event_type = 'CONFIRMED'`,
      [visit.id],
    );

    const rowBefore = await db.query<{ confirmed_at: string | null; updated_at: string }>(
      `SELECT confirmed_at, updated_at FROM property_visits WHERE id = $1`,
      [visit.id],
    );

    const confirmedAgain = await confirmVisitService({
      userId: fixture.clientId,
      visitId: visit.id,
    });

    const eventsAfter = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM property_visit_events WHERE visit_id = $1 AND event_type = 'CONFIRMED'`,
      [visit.id],
    );

    const rowAfter = await db.query<{ confirmed_at: string | null; updated_at: string }>(
      `SELECT confirmed_at, updated_at FROM property_visits WHERE id = $1`,
      [visit.id],
    );

    expect(confirmedAgain.status).toBe("CONFIRMED");
    expect(eventsAfter.rows[0].count).toBe(eventsBefore.rows[0].count);
    expect(String(rowAfter.rows[0].confirmed_at)).toBe(
      String(rowBefore.rows[0].confirmed_at),
    );
    expect(String(rowAfter.rows[0].updated_at)).toBe(
      String(rowBefore.rows[0].updated_at),
    );
  });
});

describe("visit status route hardening", () => {
  let fixture: ConversationFixture;
  let app: Awaited<ReturnType<typeof buildApp>>;
  let agentToken: string;
  let clientToken: string;

  beforeAll(async () => {
    await ensureVisitSchema();
    fixture = await seedConversationFixture();
    app = await buildApp();

    const users = await db.query<{ id: string; email: string }>(
      `SELECT id, email FROM users WHERE id = ANY($1::uuid[])`,
      [[fixture.agentId, fixture.clientId]],
    );
    const byId = Object.fromEntries(users.rows.map((row) => [row.id, row]));

    agentToken = generateAccessToken({
      userId: fixture.agentId,
      email: byId[fixture.agentId].email,
      role: "AGENT",
    });

    clientToken = generateAccessToken({
      userId: fixture.clientId,
      email: byId[fixture.clientId].email,
      role: "CLIENT",
    });
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
    await app.close();
  });

  it("rejects illegal COMPLETED → CANCELLED via API", async () => {
    const visitId = await insertVisit({ fixture, status: "COMPLETED" });

    const response = await app.inject({
      method: "POST",
      url: `/property-visits/${visitId}/cancel`,
      headers: { authorization: `Bearer ${clientToken}` },
      payload: { reason: "Nope" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("VISIT_NOT_ACTIVE");

    await db.query(`DELETE FROM property_visits WHERE id = $1`, [visitId]);
  });

  it("maps PROPERTY_NOT_AVAILABLE to 404 on create", async () => {
    await db.query(
      `UPDATE properties SET status = 'PAUSED' WHERE id = $1`,
      [fixture.propertyId],
    );

    const response = await app.inject({
      method: "POST",
      url: "/property-visits",
      headers: { authorization: `Bearer ${agentToken}` },
      payload: {
        conversationId: fixture.conversationId,
        scheduledAt: futureDate(14),
        durationMinutes: 30,
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("PROPERTY_NOT_AVAILABLE");

    await db.query(
      `UPDATE properties SET status = 'ACTIVE' WHERE id = $1`,
      [fixture.propertyId],
    );
  });
});

describe("visit terminal transitions via services", () => {
  let fixture: ConversationFixture;
  const visitIds: string[] = [];

  beforeAll(async () => {
    await ensureVisitSchema();
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    for (const id of visitIds) {
      await db.query(`DELETE FROM property_visit_events WHERE visit_id = $1`, [id]);
      await db.query(`DELETE FROM property_visit_reminders WHERE visit_id = $1`, [id]);
      await db.query(`DELETE FROM property_visits WHERE id = $1`, [id]);
    }
    await cleanupFixture(fixture);
  });

  it("completeVisitService rejects terminal COMPLETED visit", async () => {
    const visitId = await insertVisit({ fixture, status: "COMPLETED" });
    visitIds.push(visitId);

    await expect(
      completeVisitService({
        userId: fixture.agentId,
        visitId,
      }),
    ).rejects.toThrow(VisitStatusTransitionError);
  });

  it("rescheduleVisitService rejects terminal COMPLETED visit", async () => {
    const visitId = await insertVisit({ fixture, status: "COMPLETED" });
    visitIds.push(visitId);

    await expect(
      rescheduleVisitService({
        userId: fixture.agentId,
        visitId,
        scheduledAt: futureDate(20),
      }),
    ).rejects.toThrow(VisitStatusTransitionError);
  });
});
