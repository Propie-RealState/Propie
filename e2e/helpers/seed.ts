import { writeFileSync } from "node:fs";
import { join } from "node:path";

import bcrypt from "bcryptjs";

import { createE2ePool } from "./db";
import type { E2eSeedData } from "./test-data";

const OWNER_EMAIL = "e2e-owner@propie.test";
const CLIENT_EMAIL = "e2e-client@propie.test";
const CONTACT_PROPERTY_TITLE = "E2E Smoke Contact Property";
const SEED_PASSWORD = process.env.E2E_PASSWORD ?? "E2eTestPass1!";

async function upsertUser(
  pool: ReturnType<typeof createE2ePool>,
  input: {
    email: string;
    role: "OWNER" | "CLIENT";
    firstName: string;
    lastName: string;
  },
) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const existing = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE email = $1`,
    [input.email],
  );

  if (existing.rows[0]) {
    await pool.query(
      `
        UPDATE users
        SET password_hash = $2,
            role = $3,
            is_active = true,
            is_verified = true,
            updated_at = now()
        WHERE id = $1
      `,
      [existing.rows[0].id, passwordHash, input.role],
    );

    const userId = existing.rows[0].id;

    await pool.query(
      `
        INSERT INTO profiles (user_id, first_name, last_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO NOTHING
      `,
      [userId, input.firstName, input.lastName],
    );

    return userId;
  }

  const created = await pool.query<{ id: string }>(
    `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash,
        role,
        is_active,
        is_verified
      )
      VALUES ($1, $2, $3, $4, $5, true, true)
      RETURNING id
    `,
    [input.firstName, input.lastName, input.email, passwordHash, input.role],
  );

  const userId = created.rows[0].id;

  await pool.query(
    `
      INSERT INTO profiles (user_id, first_name, last_name)
      VALUES ($1, $2, $3)
    `,
    [userId, input.firstName, input.lastName],
  );

  return userId;
}

async function ensureContactProperty(
  pool: ReturnType<typeof createE2ePool>,
  ownerId: string,
) {
  const existing = await pool.query<{ id: string }>(
    `SELECT id FROM properties WHERE title = $1 LIMIT 1`,
    [CONTACT_PROPERTY_TITLE],
  );

  if (existing.rows[0]) {
    return existing.rows[0].id;
  }

  const property = await pool.query<{ id: string }>(
    `
      INSERT INTO properties (
        owner_id,
        title,
        description,
        property_type,
        operation_type,
        price,
        currency,
        bedrooms,
        bathrooms,
        area_m2,
        status,
        publisher_id,
        publisher_type,
        published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $1, 'OWNER', now())
      RETURNING id
    `,
    [
      ownerId,
      CONTACT_PROPERTY_TITLE,
      "Propiedad de prueba para smoke tests E2E.",
      "HOUSE",
      "SALE",
      150000,
      "USD",
      3,
      2,
      120,
      "ACTIVE",
    ],
  );

  const propertyId = property.rows[0].id;

  await pool.query(
    `
      INSERT INTO property_commercialization (
        property_id,
        commercialization_type,
        allow_chat
      )
      VALUES ($1, 'DIRECT', true)
      ON CONFLICT (property_id) DO UPDATE
      SET allow_chat = true,
          updated_at = now()
    `,
    [propertyId],
  );

  await pool.query(
    `
      INSERT INTO property_locations (
        property_id,
        country,
        province,
        city,
        neighborhood,
        address,
        latitude,
        longitude
      )
      VALUES ($1, 'Argentina', 'Cordoba', 'Cordoba', 'Centro', $2, $3, $4)
      ON CONFLICT (property_id) DO NOTHING
    `,
    [propertyId, "Av. Colon 100, Cordoba", -31.4201, -64.1888],
  );

  await pool.query(
    `
      INSERT INTO property_images (
        property_id,
        image_url,
        thumb_url,
        is_cover,
        display_order
      )
      VALUES ($1, $2, $2, true, 0)
    `,
    [
      propertyId,
      "https://placehold.co/600x400/png?text=E2E",
    ],
  );

  return propertyId;
}

async function ensureVisitConversation(
  pool: ReturnType<typeof createE2ePool>,
  propertyId: string,
  ownerId: string,
  clientId: string,
) {
  const existing = await pool.query<{ id: string }>(
    `
      SELECT id
      FROM property_conversations
      WHERE property_id = $1
        AND client_id = $2
        AND conversation_type = 'PROPERTY_CLIENT'
      LIMIT 1
    `,
    [propertyId, clientId],
  );

  if (existing.rows[0]) {
    return existing.rows[0].id;
  }

  const conversation = await pool.query<{ id: string }>(
    `
      INSERT INTO property_conversations (
        property_id,
        conversation_type,
        client_id,
        status
      )
      VALUES ($1, 'PROPERTY_CLIENT', $2, 'OPEN')
      RETURNING id
    `,
    [propertyId, clientId],
  );

  const conversationId = conversation.rows[0].id;

  await pool.query(
    `
      INSERT INTO property_conversation_messages (
        conversation_id,
        sender_id,
        sender_role,
        body
      )
      VALUES ($1, $2, 'CLIENT', $3)
    `,
    [conversationId, clientId, "Hola, me interesa coordinar una visita."],
  );

  for (const participant of [
    { userId: clientId, role: "CLIENT" },
    { userId: ownerId, role: "OWNER" },
  ]) {
    await pool.query(
      `
        INSERT INTO property_conversation_participant_states (
          conversation_id,
          user_id,
          participant_role
        )
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `,
      [conversationId, participant.userId, participant.role],
    );
  }

  return conversationId;
}

export async function seedE2eData(): Promise<E2eSeedData> {
  const pool = createE2ePool();

  try {
    const ownerId = await upsertUser(pool, {
      email: OWNER_EMAIL,
      role: "OWNER",
      firstName: "E2E",
      lastName: "Owner",
    });

    const clientId = await upsertUser(pool, {
      email: CLIENT_EMAIL,
      role: "CLIENT",
      firstName: "E2E",
      lastName: "Client",
    });

    const contactPropertyId = await ensureContactProperty(pool, ownerId);
    const visitConversationId = await ensureVisitConversation(
      pool,
      contactPropertyId,
      ownerId,
      clientId,
    );

    const seedData: E2eSeedData = {
      password: SEED_PASSWORD,
      owner: { id: ownerId, email: OWNER_EMAIL },
      client: { id: clientId, email: CLIENT_EMAIL },
      contactProperty: {
        id: contactPropertyId,
        title: CONTACT_PROPERTY_TITLE,
      },
      visitConversation: { id: visitConversationId },
    };

    writeFileSync(
      join(process.cwd(), "e2e", ".seed-output.json"),
      JSON.stringify(seedData, null, 2),
      "utf8",
    );

    return seedData;
  } finally {
    await pool.end();
  }
}
