import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  buildRegisterPayload,
  cleanupTestUsers,
  registerUnverifiedUserViaApi,
  uniqueEmail,
} from "../helpers/auth-fixtures";

describe("auth register", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const userIds: string[] = [];

  beforeAll(async () => {
    process.env.E2E_CAPTURE_VERIFICATION = "true";
    app = await buildApp();
  });

  afterAll(async () => {
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it.each(["OWNER", "AGENT", "CLIENT"] as const)(
    "registers a %s and creates a verification token",
    async (role) => {
      const registered = await registerUnverifiedUserViaApi(app, role);
      userIds.push(registered.userId);

      expect(registered.accessToken).toBeUndefined();

      const row = await db.query<{ role: string; email: string; is_verified: boolean }>(
        `SELECT role, email, is_verified FROM users WHERE id = $1`,
        [registered.userId],
      );

      expect(row.rows[0].role).toBe(role);
      expect(row.rows[0].email).toBe(registered.email);
      expect(row.rows[0].is_verified).toBe(false);

      const tokenCount = await db.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM email_verification_tokens
          WHERE user_id = $1
        `,
        [registered.userId],
      );

      expect(Number(tokenCount.rows[0]?.count ?? 0)).toBe(1);
    },
  );

  it("rejects duplicate email", async () => {
    const email = uniqueEmail("duplicate");
    const first = await registerUnverifiedUserViaApi(app, "OWNER", { email });
    userIds.push(first.userId);

    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: buildRegisterPayload("CLIENT", { email }),
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("rejects validation failures", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        role: "OWNER",
        firstName: "A",
        lastName: "B",
        email: "not-an-email",
        password: "short",
        dni: "1",
        birthDate: "1990-01-01",
        nationality: "AR",
        cuitCuil: "1",
        address: "x",
        mainGoal: "PUBLISH",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("VALIDATION_ERROR");
  });

  it("returns 403 when public registration is disabled", async () => {
    const previous = process.env.PUBLIC_REGISTRATION_ENABLED;
    process.env.PUBLIC_REGISTRATION_ENABLED = "false";

    try {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: buildRegisterPayload("OWNER"),
      });

      expect(response.statusCode).toBe(403);
      expect(response.json().error).toBe("REGISTRATION_DISABLED");
    } finally {
      process.env.PUBLIC_REGISTRATION_ENABLED = previous;
    }
  });
});
