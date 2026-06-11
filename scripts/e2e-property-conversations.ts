/**
 * Manual E2E verification for Property Conversations.
 * Run: npx tsx scripts/e2e-property-conversations.ts
 */
import { randomUUID } from "node:crypto";

import { db } from "@/database/client";
import { generateAccessToken } from "@/services/auth/jwt";
import { deactivatePropertyAgentAssignment } from "@/modules/property-conversations/services/deactivate-property-agent.service";
import { createTestUser } from "../tests/helpers/test-users";

const API = "http://127.0.0.1:3000";

type ScenarioResult = {
  id: number;
  name: string;
  passed: boolean;
  detail: string;
  rootCause: string | null;
  file: string | null;
};

const results: ScenarioResult[] = [];

function record(
  id: number,
  name: string,
  passed: boolean,
  detail: string,
  rootCause: string | null = null,
  file: string | null = null,
) {
  results.push({ id, name, passed, detail, rootCause, file });
  console.log(`[${passed ? "PASS" : "FAIL"}] ${id}. ${name}`);
  console.log(`       ${detail}`);
  if (!passed && rootCause) {
    console.log(`       root: ${rootCause}`);
    if (file) console.log(`       file: ${file}`);
  }
}

async function getEmail(userId: string) {
  const row = await db.query<{ email: string }>(
    `SELECT email FROM users WHERE id = $1`,
    [userId],
  );
  return row.rows[0].email;
}

async function api(
  method: string,
  path: string,
  token: string | null,
  body?: Record<string, unknown>,
) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let json: { success?: boolean; data?: unknown; message?: string } = {};

  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    json = { message: text };
  }

  return { status: response.status, json };
}

async function main() {
  const ownerId = await createTestUser("OWNER");
  const agentId = await createTestUser("AGENT");
  const clientId = await createTestUser("CLIENT");

  const ownerToken = generateAccessToken({
    userId: ownerId,
    email: await getEmail(ownerId),
    role: "OWNER",
  });
  const agentToken = generateAccessToken({
    userId: agentId,
    email: await getEmail(agentId),
    role: "AGENT",
  });
  const clientToken = generateAccessToken({
    userId: clientId,
    email: await getEmail(clientId),
    role: "CLIENT",
  });

  const property = await db.query<{ id: string }>(
    `
      INSERT INTO properties (
        owner_id,
        title,
        property_type,
        operation_type,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [ownerId, "E2E Property", "HOUSE", "SALE", "PUBLISHED"],
  );
  const propertyId = property.rows[0].id;

  await db.query(
    `
      INSERT INTO property_commercialization (
        property_id,
        commercialization_type,
        allow_chat
      )
      VALUES ($1, $2, true)
    `,
    [propertyId, "AGENTS"],
  );

  await db.query(
    `
      INSERT INTO property_assignments (
        property_id,
        agent_id,
        assigned_by,
        is_active
      )
      VALUES ($1, $2, $3, true)
    `,
    [propertyId, agentId, ownerId],
  );

  let conversationId: string | null = null;

  try {
    const createRes = await api("POST", "/property-conversations", clientToken, {
      propertyId,
    });
    conversationId =
      (createRes.json.data as { id?: string } | undefined)?.id ?? null;

    const s1 =
      createRes.status === 201 &&
      createRes.json.success === true &&
      (createRes.json.data as { propertyId?: string })?.propertyId === propertyId;

    record(
      1,
      "Client creates conversation from published property (allow_chat=true)",
      s1,
      `status=${createRes.status}, id=${conversationId}`,
      s1 ? null : JSON.stringify(createRes.json),
      "src/modules/property-conversations/services/start-conversation.service.ts",
    );

    const msg1Res = await api(
      "POST",
      `/property-conversations/${conversationId}/messages`,
      clientToken,
      { body: "Hola, consulta E2E" },
    );
    const s2 = msg1Res.status === 201 && msg1Res.json.success === true;
    record(
      2,
      "Client sends first message",
      s2,
      `status=${msg1Res.status}`,
      s2 ? null : JSON.stringify(msg1Res.json),
      "src/modules/property-conversations/services/send-message.service.ts",
    );

    const ownerList = await api("GET", "/property-conversations", ownerToken);
    const ownerIds = ((ownerList.json.data as { id: string }[]) ?? []).map(
      (item) => item.id,
    );
    const s3 = ownerList.status === 200 && ownerIds.includes(conversationId!);
    record(
      3,
      "Owner sees conversation in inbox",
      s3,
      `status=${ownerList.status}, count=${ownerIds.length}`,
      s3 ? null : "Owner inbox missing conversation",
      "src/modules/property-conversations/repositories/property-conversations.repository.ts",
    );

    const agentList = await api("GET", "/property-conversations", agentToken);
    const agentIds = ((agentList.json.data as { id: string }[]) ?? []).map(
      (item) => item.id,
    );
    const s4 = agentList.status === 200 && agentIds.includes(conversationId!);
    record(
      4,
      "Enabled agent sees conversation in inbox",
      s4,
      `status=${agentList.status}, count=${agentIds.length}`,
      s4 ? null : "Agent inbox missing conversation",
      "src/modules/property-conversations/repositories/property-conversations.repository.ts",
    );

    const agentReply = await api(
      "POST",
      `/property-conversations/${conversationId}/messages`,
      agentToken,
      { body: "Respuesta del agente E2E" },
    );
    const s5 = agentReply.status === 201 && agentReply.json.success === true;
    record(
      5,
      "Agent replies",
      s5,
      `status=${agentReply.status}`,
      s5 ? null : JSON.stringify(agentReply.json),
      "src/modules/property-conversations/services/send-message.service.ts",
    );

    const clientMsgs = await api(
      "GET",
      `/property-conversations/${conversationId}/messages`,
      clientToken,
    );
    const bodies = ((clientMsgs.json.data as { body: string }[]) ?? []).map(
      (item) => item.body,
    );
    const s6 =
      clientMsgs.status === 200 && bodies.includes("Respuesta del agente E2E");
    record(
      6,
      "Client receives reply",
      s6,
      `status=${clientMsgs.status}, messages=${bodies.length}`,
      s6 ? null : `bodies=${JSON.stringify(bodies)}`,
      "src/modules/property-conversations/services/list-messages.service.ts",
    );

    const notifOwner = await db.query<{ c: number }>(
      `
        SELECT COUNT(*)::int AS c
        FROM notifications
        WHERE user_id = $1
          AND entity_type = 'property_conversation'
          AND entity_id = $2
      `,
      [ownerId, conversationId],
    );
    const notifAgent = await db.query<{ c: number }>(
      `
        SELECT COUNT(*)::int AS c
        FROM notifications
        WHERE user_id = $1
          AND entity_type = 'property_conversation'
          AND entity_id = $2
      `,
      [agentId, conversationId],
    );
    const notifClient = await db.query<{ c: number }>(
      `
        SELECT COUNT(*)::int AS c
        FROM notifications
        WHERE user_id = $1
          AND entity_type = 'property_conversation'
          AND entity_id = $2
      `,
      [clientId, conversationId],
    );
    const s7 =
      notifOwner.rows[0].c >= 1 &&
      notifAgent.rows[0].c >= 1 &&
      notifClient.rows[0].c >= 1;
    record(
      7,
      "Notifications are generated",
      s7,
      `owner=${notifOwner.rows[0].c}, agent=${notifAgent.rows[0].c}, client=${notifClient.rows[0].c}`,
      s7 ? null : "Missing notifications for participants",
      "src/modules/property-conversations/services/send-message.service.ts",
    );

    const unreadOwner = await db.query<{ unread_count: number }>(
      `
        SELECT unread_count
        FROM property_conversation_participant_states
        WHERE conversation_id = $1 AND user_id = $2
      `,
      [conversationId, ownerId],
    );
    const unreadAgent = await db.query<{ unread_count: number }>(
      `
        SELECT unread_count
        FROM property_conversation_participant_states
        WHERE conversation_id = $1 AND user_id = $2
      `,
      [conversationId, agentId],
    );
    const unreadClient = await db.query<{ unread_count: number }>(
      `
        SELECT unread_count
        FROM property_conversation_participant_states
        WHERE conversation_id = $1 AND user_id = $2
      `,
      [conversationId, clientId],
    );
    const ownerUnread = unreadOwner.rows[0]?.unread_count ?? -1;
    const agentUnread = unreadAgent.rows[0]?.unread_count ?? -1;
    const clientUnread = unreadClient.rows[0]?.unread_count ?? -1;
    const s8 = ownerUnread >= 1 && agentUnread >= 1 && clientUnread >= 1;
    record(
      8,
      "Unread counters update correctly",
      s8,
      `owner=${ownerUnread}, agent=${agentUnread}, client=${clientUnread}`,
      s8 ? null : "Unread not incremented for all recipients",
      "src/modules/property-conversations/services/send-message.service.ts",
    );

    const markRead = await api(
      "POST",
      `/property-conversations/${conversationId}/read`,
      ownerToken,
      {},
    );
    const afterRead = await db.query<{
      unread_count: number;
      last_read_at: string | null;
    }>(
      `
        SELECT unread_count, last_read_at
        FROM property_conversation_participant_states
        WHERE conversation_id = $1 AND user_id = $2
      `,
      [conversationId, ownerId],
    );
    const s9 =
      markRead.status === 200 &&
      afterRead.rows[0]?.unread_count === 0 &&
      afterRead.rows[0]?.last_read_at != null;
    record(
      9,
      "Mark read works",
      s9,
      `status=${markRead.status}, unread=${afterRead.rows[0]?.unread_count}`,
      s9 ? null : JSON.stringify(markRead.json),
      "src/modules/property-conversations/services/mark-read.service.ts",
    );

    await deactivatePropertyAgentAssignment({
      propertyId,
      agentId,
      deactivatedBy: ownerId,
    });

    const sendAfterRevoke = await api(
      "POST",
      `/property-conversations/${conversationId}/messages`,
      agentToken,
      { body: "No debería enviar" },
    );
    const histList = await api(
      "GET",
      "/property-conversations/historical",
      agentToken,
    );
    const histIds = ((histList.json.data as { id: string }[]) ?? []).map(
      (item) => item.id,
    );
    const histMsgs = await api(
      "GET",
      `/property-conversations/${conversationId}/messages`,
      agentToken,
    );
    const revokedState = await db.query<{ revoked_at: string | null }>(
      `
        SELECT revoked_at
        FROM property_conversation_participant_states
        WHERE conversation_id = $1 AND user_id = $2
      `,
      [conversationId, agentId],
    );
    const s10 =
      sendAfterRevoke.status >= 400 &&
      histList.status === 200 &&
      histIds.includes(conversationId!) &&
      histMsgs.status === 200 &&
      revokedState.rows[0]?.revoked_at != null;
    record(
      10,
      "Historical permissions behave correctly",
      s10,
      `sendBlocked=${sendAfterRevoke.status}, historical=${histIds.includes(conversationId!)}, readMsgs=${histMsgs.status}`,
      s10 ? null : "Revoked agent permissions incorrect",
      "src/modules/property-conversations/services/deactivate-property-agent.service.ts",
    );
  } finally {
    if (conversationId) {
      await db.query(`DELETE FROM notifications WHERE entity_id = $1`, [
        conversationId,
      ]);
    }

    await db.query(`DELETE FROM property_conversations WHERE property_id = $1`, [
      propertyId,
    ]);
    await db.query(`DELETE FROM property_commercialization WHERE property_id = $1`, [
      propertyId,
    ]);
    await db.query(`DELETE FROM property_assignments WHERE property_id = $1`, [
      propertyId,
    ]);
    await db.query(`DELETE FROM properties WHERE id = $1`, [propertyId]);
    await db.query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [
      [ownerId, agentId, clientId],
    ]);
  }

  const passed = results.filter((item) => item.passed).length;
  const failed = results.filter((item) => !item.passed);

  console.log("\n=== SUMMARY ===");
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Completion: ${Math.round((passed / results.length) * 100)}%`);

  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
