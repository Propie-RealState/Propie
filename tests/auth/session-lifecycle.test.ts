import jwt from "jsonwebtoken";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import { hashToken } from "@/services/auth/session";
import { generateRefreshToken } from "@/services/auth/jwt";
import {
  cleanupTestUsers,
  logoutViaApi,
  refreshViaApi,
  registerAndVerifyUserViaApi,
  registerUnverifiedUserViaApi,
} from "../helpers/auth-fixtures";

function decodeAccessTokenRole(token: string): string {
  const decoded = jwt.decode(token) as { role?: string } | null;
  return decoded?.role ?? "";
}

describe("session lifecycle", () => {
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

  it("logout revokes the refresh session", async () => {
    const user = await registerAndVerifyUserViaApi(app, "OWNER");
    userIds.push(user.userId);

    expect(user.refreshToken).toBeTruthy();

    const logoutResponse = await logoutViaApi(app, user.refreshToken!);
    expect(logoutResponse.statusCode).toBe(200);

    const refreshResponse = await refreshViaApi(app, user.refreshToken!);
    expect(refreshResponse.statusCode).toBe(401);
  });

  it("refresh rotates the session and rejects the old refresh token", async () => {
    const user = await registerAndVerifyUserViaApi(app, "CLIENT");
    userIds.push(user.userId);

    const refreshResponse = await refreshViaApi(app, user.refreshToken!);

    expect(refreshResponse.statusCode).toBe(200);

    const refreshed = refreshResponse.json().data as {
      accessToken: string;
      refreshToken: string;
    };

    expect(refreshed.refreshToken).not.toBe(user.refreshToken);

    const oldSession = await db.query<{ is_revoked: boolean }>(
      `
        SELECT is_revoked
        FROM sessions
        WHERE refresh_token_hash = $1
      `,
      [hashToken(user.refreshToken!)],
    );

    expect(oldSession.rows[0]?.is_revoked).toBe(true);

    const newTokenResponse = await refreshViaApi(
      app,
      refreshed.refreshToken,
    );

    expect(newTokenResponse.statusCode).toBe(200);

    const oldTokenResponse = await refreshViaApi(
      app,
      user.refreshToken!,
    );

    expect(oldTokenResponse.statusCode).toBe(401);
    expect(oldTokenResponse.json().error.code).toBe("REFRESH_TOKEN_REUSE");
  });

  it("reloads role from the database on refresh", async () => {
    const user = await registerAndVerifyUserViaApi(app, "OWNER");
    userIds.push(user.userId);

    expect(decodeAccessTokenRole(user.accessToken!)).toBe("OWNER");

    await db.query(`UPDATE users SET role = 'CLIENT' WHERE id = $1`, [
      user.userId,
    ]);

    const refreshResponse = await refreshViaApi(
      app,
      user.refreshToken!,
    );

    expect(refreshResponse.statusCode).toBe(200);

    const refreshed = refreshResponse.json().data as {
      accessToken: string;
    };

    expect(decodeAccessTokenRole(refreshed.accessToken)).toBe("CLIENT");
  });

  it("rejects refresh for inactive users", async () => {
    const user = await registerAndVerifyUserViaApi(app, "AGENT");
    userIds.push(user.userId);

    await db.query(`UPDATE users SET is_active = false WHERE id = $1`, [
      user.userId,
    ]);

    const refreshResponse = await refreshViaApi(app, user.refreshToken!);

    expect(refreshResponse.statusCode).toBe(403);
    expect(refreshResponse.json().error.code).toBe("ACCOUNT_INACTIVE");
  });

  it("rejects refresh for unverified users", async () => {
    const user = await registerAndVerifyUserViaApi(app, "OWNER");
    userIds.push(user.userId);

    await db.query(`UPDATE users SET is_verified = false WHERE id = $1`, [
      user.userId,
    ]);

    const refreshResponse = await refreshViaApi(app, user.refreshToken!);

    expect(refreshResponse.statusCode).toBe(403);
    expect(refreshResponse.json().error.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("invalidates all sessions when a revoked refresh token is reused", async () => {
    const user = await registerAndVerifyUserViaApi(app, "CLIENT");
    userIds.push(user.userId);

    const originalRefresh = user.refreshToken!;

    const rotated = await refreshViaApi(app, originalRefresh);
    expect(rotated.statusCode).toBe(200);

    const activeRefresh = rotated.json().data.refreshToken as string;

    const reuseResponse = await refreshViaApi(app, originalRefresh);
    expect(reuseResponse.statusCode).toBe(401);
    expect(reuseResponse.json().error.code).toBe("REFRESH_TOKEN_REUSE");

    const activeAfterReuse = await refreshViaApi(app, activeRefresh);
    expect(activeAfterReuse.statusCode).toBe(401);
  });

  it("creates a valid session for an unverified user only when verified at refresh time", async () => {
    const unverified = await registerUnverifiedUserViaApi(app, "OWNER");
    userIds.push(unverified.userId);

    const refreshToken = generateRefreshToken({
      userId: unverified.userId,
      email: unverified.email,
      role: "OWNER",
    });

    await db.query(
      `
        INSERT INTO sessions (
          user_id,
          refresh_token_hash,
          expires_at
        )
        VALUES ($1, $2, NOW() + interval '30 days')
      `,
      [unverified.userId, hashToken(refreshToken)],
    );

    const refreshResponse = await refreshViaApi(app, refreshToken);
    expect(refreshResponse.statusCode).toBe(403);
    expect(refreshResponse.json().error.code).toBe("EMAIL_NOT_VERIFIED");
  });
});
