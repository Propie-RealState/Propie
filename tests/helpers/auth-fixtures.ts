import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";

import { db } from "@/database/client";
import type { RegisterInput } from "@/modules/auth/schemas/register.schema";
import { readCapturedVerificationCode } from "@/services/auth/email-verification.test-utils";

export const TEST_PASSWORD = "TestPass1!";

export type UserRole = "OWNER" | "AGENT" | "CLIENT";

export type RegisteredUser = {
  userId: string;
  email: string;
  password: string;
  role: UserRole;
  accessToken?: string;
  refreshToken?: string;
};

export function uniqueEmail(role: string) {
  return `test-${role.toLowerCase()}-${randomUUID().slice(0, 8)}@propie.test`;
}

export function buildRegisterPayload(
  role: UserRole,
  overrides: Partial<RegisterInput> = {},
): RegisterInput {
  const email = overrides.email ?? uniqueEmail(role);

  return {
    role,
    firstName: "Test",
    lastName: role,
    email,
    password: overrides.password ?? TEST_PASSWORD,
    dni: "12345678",
    birthDate: "1990-01-01",
    nationality: "Argentina",
    cuitCuil: "20123456789",
    address: "Av Test 123, Cordoba",
    mainGoal: role === "CLIENT" ? "EXPLORE" : "PUBLISH",
    ...overrides,
    role,
    email,
  };
}

export async function registerUnverifiedUserViaApi(
  app: FastifyInstance,
  role: UserRole,
  overrides: Partial<RegisterInput> = {},
): Promise<RegisteredUser> {
  const payload = buildRegisterPayload(role, overrides);

  const response = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload,
  });

  if (response.statusCode !== 201) {
    throw new Error(`Register failed: ${response.statusCode} ${response.body}`);
  }

  const body = response.json() as {
    data: {
      email: string;
      requiresVerification: boolean;
    };
  };

  const userRow = await db.query<{ id: string }>(
    `SELECT id FROM users WHERE email = $1`,
    [payload.email],
  );

  return {
    userId: userRow.rows[0].id,
    email: body.data.email,
    password: payload.password,
    role,
  };
}

export async function registerUserViaApi(
  app: FastifyInstance,
  role: UserRole,
  overrides: Partial<RegisterInput> = {},
): Promise<RegisteredUser> {
  return registerAndVerifyUserViaApi(app, role, overrides);
}

export async function verifyEmailViaApi(
  app: FastifyInstance,
  email: string,
  code?: string,
) {
  const verificationCode = code ?? readCapturedVerificationCode(email);

  if (!verificationCode) {
    throw new Error(`Missing verification code for ${email}`);
  }

  return app.inject({
    method: "POST",
    url: "/auth/verify-email",
    payload: {
      email,
      code: verificationCode,
    },
  });
}

export async function registerAndVerifyUserViaApi(
  app: FastifyInstance,
  role: UserRole,
  overrides: Partial<RegisterInput> = {},
): Promise<RegisteredUser> {
  const registered = await registerUnverifiedUserViaApi(app, role, overrides);
  const verifyResponse = await verifyEmailViaApi(app, registered.email);

  if (verifyResponse.statusCode !== 200) {
    throw new Error(
      `Verify failed: ${verifyResponse.statusCode} ${verifyResponse.body}`,
    );
  }

  const loginResponse = await loginViaApi(
    app,
    registered.email,
    registered.password,
  );

  if (loginResponse.statusCode !== 200) {
    throw new Error(
      `Login failed: ${loginResponse.statusCode} ${loginResponse.body}`,
    );
  }

  const loginBody = loginResponse.json() as {
    data: {
      accessToken: string;
      refreshToken: string;
    };
  };

  return {
    ...registered,
    accessToken: loginBody.data.accessToken,
    refreshToken: loginBody.data.refreshToken,
  };
}

export async function loginViaApi(
  app: FastifyInstance,
  email: string,
  password: string,
) {
  return app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { email, password },
  });
}

export async function refreshViaApi(
  app: FastifyInstance,
  refreshToken: string,
) {
  return app.inject({
    method: "POST",
    url: "/auth/refresh",
    payload: { refreshToken },
  });
}

export async function logoutViaApi(
  app: FastifyInstance,
  refreshToken: string,
) {
  return app.inject({
    method: "POST",
    url: "/auth/logout",
    payload: { refreshToken },
  });
}

export async function insertPropertyImage(propertyId: string) {
  await db.query(
    `
      INSERT INTO property_images (
        property_id,
        image_url,
        is_cover
      )
      VALUES ($1, $2, true)
    `,
    [
      propertyId,
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    ],
  );
}

export async function cleanupProperty(propertyId: string) {
  await db.query(`DELETE FROM property_images WHERE property_id = $1`, [
    propertyId,
  ]);
  await db.query(`DELETE FROM property_amenities WHERE property_id = $1`, [
    propertyId,
  ]);
  await db.query(`DELETE FROM property_locations WHERE property_id = $1`, [
    propertyId,
  ]);
  await db.query(`DELETE FROM property_commercialization WHERE property_id = $1`, [
    propertyId,
  ]);
  await db.query(`DELETE FROM property_events WHERE property_id = $1`, [
    propertyId,
  ]);
  await db.query(`DELETE FROM agent_applications WHERE property_id = $1`, [
    propertyId,
  ]);
  await db.query(`DELETE FROM properties WHERE id = $1`, [propertyId]);
}

export async function cleanupTestUsers(userIds: string[]) {
  if (userIds.length === 0) {
    return;
  }

  await db.query(
    `DELETE FROM email_verification_tokens WHERE user_id = ANY($1::uuid[])`,
    [userIds],
  );
  await db.query(`DELETE FROM sessions WHERE user_id = ANY($1::uuid[])`, [
    userIds,
  ]);
  await db.query(`DELETE FROM notifications WHERE user_id = ANY($1::uuid[])`, [
    userIds,
  ]);
  await db.query(
    `DELETE FROM notification_preferences WHERE user_id = ANY($1::uuid[])`,
    [userIds],
  );
  await db.query(`DELETE FROM push_subscriptions WHERE user_id = ANY($1::uuid[])`, [
    userIds,
  ]);
  await db.query(`DELETE FROM profiles WHERE user_id = ANY($1::uuid[])`, [
    userIds,
  ]);
  await db.query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [userIds]);
}
