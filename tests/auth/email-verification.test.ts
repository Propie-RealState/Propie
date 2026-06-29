import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import { notificationService } from "@/notifications";
import { readCapturedVerificationCode } from "@/services/auth/email-verification.test-utils";
import {
  generateVerificationCode,
  issueEmailVerificationCode,
  resendEmailVerificationCode,
  verifyEmailWithCode,
} from "@/services/auth/email-verification.service";
import { hashToken } from "@/services/auth/session";
import {
  cleanupTestUsers,
  loginViaApi,
  registerUnverifiedUserViaApi,
  TEST_PASSWORD,
  uniqueEmail,
  verifyEmailViaApi,
} from "../helpers/auth-fixtures";

describe("email verification", () => {
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

  it("generates unpredictable 6-digit codes", () => {
    const codes = new Set(
      Array.from({ length: 20 }, () => generateVerificationCode()),
    );

    expect(codes.size).toBeGreaterThan(1);
    for (const code of codes) {
      expect(code).toMatch(/^\d{6}$/);
      expect(code).not.toBe("123456");
    }
  });

  it("creates a verification token on registration and notifies via NotificationService", async () => {
    const sendSpy = vi.spyOn(notificationService, "send");

    const registered = await registerUnverifiedUserViaApi(app, "OWNER");
    userIds.push(registered.userId);

    const tokenCount = await db.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM email_verification_tokens
        WHERE user_id = $1
          AND verified_at IS NULL
      `,
      [registered.userId],
    );

    expect(Number(tokenCount.rows[0]?.count ?? 0)).toBe(1);
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "email",
        template: "verify-email",
        recipient: registered.email,
        payload: expect.objectContaining({
          code: expect.stringMatching(/^\d{6}$/),
        }),
      }),
    );

    sendSpy.mockRestore();
  });

  it("verifies a valid code and allows login", async () => {
    const registered = await registerUnverifiedUserViaApi(app, "CLIENT");
    userIds.push(registered.userId);

    await verifyEmailViaApi(app, registered.email);

    const verifiedRow = await db.query<{ is_verified: boolean }>(
      `SELECT is_verified FROM users WHERE id = $1`,
      [registered.userId],
    );

    expect(verifiedRow.rows[0]?.is_verified).toBe(true);

    const loginResponse = await loginViaApi(
      app,
      registered.email,
      registered.password,
    );

    expect(loginResponse.statusCode).toBe(200);
  });

  it("rejects invalid verification codes", async () => {
    const registered = await registerUnverifiedUserViaApi(app, "AGENT");
    userIds.push(registered.userId);

    const response = await app.inject({
      method: "POST",
      url: "/auth/verify-email",
      payload: {
        email: registered.email,
        code: "000000",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_VERIFICATION_CODE");
  });

  it("rejects expired verification codes", async () => {
    const registered = await registerUnverifiedUserViaApi(app, "OWNER");
    userIds.push(registered.userId);

    const code = readCapturedVerificationCode(registered.email);
    expect(code).toBeTruthy();

    await db.query(
      `
        UPDATE email_verification_tokens
        SET expires_at = now() - interval '1 minute'
        WHERE user_id = $1
      `,
      [registered.userId],
    );

    const response = await app.inject({
      method: "POST",
      url: "/auth/verify-email",
      payload: {
        email: registered.email,
        code,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("VERIFICATION_CODE_EXPIRED");
  });

  it("rejects reused verification codes", async () => {
    const registered = await registerUnverifiedUserViaApi(app, "CLIENT");
    userIds.push(registered.userId);

    const code = readCapturedVerificationCode(registered.email);
    expect(code).toBeTruthy();

    await db.query(
      `
        UPDATE email_verification_tokens
        SET verified_at = now()
        WHERE user_id = $1
          AND verified_at IS NULL
      `,
      [registered.userId],
    );

    const response = await app.inject({
      method: "POST",
      url: "/auth/verify-email",
      payload: {
        email: registered.email,
        code,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("VERIFICATION_CODE_ALREADY_USED");
  });

  it("rejects login for unverified users", async () => {
    const registered = await registerUnverifiedUserViaApi(app, "OWNER");
    userIds.push(registered.userId);

    const response = await loginViaApi(
      app,
      registered.email,
      registered.password,
    );

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("rejects login for inactive users", async () => {
    const registered = await registerUnverifiedUserViaApi(app, "OWNER");
    userIds.push(registered.userId);

    await verifyEmailViaApi(app, registered.email);

    await db.query(
      `UPDATE users SET is_active = false WHERE id = $1`,
      [registered.userId],
    );

    const response = await loginViaApi(
      app,
      registered.email,
      registered.password,
    );

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("ACCOUNT_INACTIVE");
  });

  it("resends verification codes through NotificationService", async () => {
    const sendSpy = vi.spyOn(notificationService, "send");
    const email = uniqueEmail("resend");

    const created = await db.query<{ id: string }>(
      `
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password_hash,
          role,
          is_verified
        )
        VALUES ('Test', 'User', $1, 'hash', 'CLIENT', false)
        RETURNING id
      `,
      [email],
    );

    const userId = created.rows[0].id;
    userIds.push(userId);

    await issueEmailVerificationCode({
      userId,
      email,
      firstName: "Test",
    });

    sendSpy.mockClear();

    await resendEmailVerificationCode(email);

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: email,
        template: "verify-email",
      }),
    );

    sendSpy.mockRestore();
  });

  it("stores hashed verification tokens only", async () => {
    const registered = await registerUnverifiedUserViaApi(app, "AGENT");
    userIds.push(registered.userId);

    const code = readCapturedVerificationCode(registered.email);
    expect(code).toBeTruthy();

    const row = await db.query<{ token: string }>(
      `
        SELECT token
        FROM email_verification_tokens
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [registered.userId],
    );

    expect(row.rows[0]?.token).toBe(hashToken(code!));
    expect(row.rows[0]?.token).not.toBe(code);
  });
});
