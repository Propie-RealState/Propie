import crypto from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import { hashToken } from "@/services/auth/session";
import {
  cleanupTestUsers,
  loginViaApi,
  registerUserViaApi,
  TEST_PASSWORD,
} from "../helpers/auth-fixtures";

const NEW_PASSWORD = "ResetPass1!";

async function seedPasswordResetToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");

  await db.query(
    `
      INSERT INTO password_reset_tokens (
        user_id,
        token,
        expires_at
      )
      VALUES ($1, $2, now() + interval '1 hour')
    `,
    [userId, hashToken(rawToken)],
  );

  return rawToken;
}

describe("password reset", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let user: Awaited<ReturnType<typeof registerUserViaApi>>;
  const userIds: string[] = [];

  beforeAll(async () => {
    app = await buildApp();
    user = await registerUserViaApi(app, "CLIENT");
    userIds.push(user.userId);
  });

  afterAll(async () => {
    await db.query(
      `DELETE FROM password_reset_tokens WHERE user_id = ANY($1::uuid[])`,
      [userIds],
    );
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("returns the same response for existing and unknown emails", async () => {
    const existing = await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: user.email },
    });

    const unknown = await app.inject({
      method: "POST",
      url: "/auth/forgot-password",
      payload: { email: "missing-user@propie.test" },
    });

    expect(existing.statusCode).toBe(200);
    expect(unknown.statusCode).toBe(200);
    expect(existing.json().message).toBe(unknown.json().message);
  });

  it("resets password with a valid token", async () => {
    const rawToken = await seedPasswordResetToken(user.userId);

    const resetResponse = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        token: rawToken,
        password: NEW_PASSWORD,
      },
    });

    expect(resetResponse.statusCode).toBe(200);

    const oldLogin = await loginViaApi(app, user.email, TEST_PASSWORD);
    expect(oldLogin.statusCode).toBe(401);

    const newLogin = await loginViaApi(app, user.email, NEW_PASSWORD);
    expect(newLogin.statusCode).toBe(200);
  });

  it("rejects reused tokens", async () => {
    const rawToken = await seedPasswordResetToken(user.userId);

    const first = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        token: rawToken,
        password: TEST_PASSWORD,
      },
    });

    expect(first.statusCode).toBe(200);

    const second = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        token: rawToken,
        password: NEW_PASSWORD,
      },
    });

    expect(second.statusCode).toBe(400);
    expect(second.json().error.code).toBe("INVALID_OR_EXPIRED_TOKEN");
  });

  it("rejects expired tokens", async () => {
    const rawToken = crypto.randomBytes(32).toString("hex");

    await db.query(
      `
        INSERT INTO password_reset_tokens (
          user_id,
          token,
          expires_at
        )
        VALUES ($1, $2, now() - interval '1 hour')
      `,
      [user.userId, hashToken(rawToken)],
    );

    const response = await app.inject({
      method: "POST",
      url: "/auth/reset-password",
      payload: {
        token: rawToken,
        password: NEW_PASSWORD,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_OR_EXPIRED_TOKEN");
  });
});
