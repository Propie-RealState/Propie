import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  assertE2eCaptureVerificationSafe,
  isE2eCaptureVerificationEnabled,
} from "@/config/e2e-capture-verification";
import { buildEmailRateLimitConfig } from "@/config/rate-limit";
import {
  cleanupExpiredVerificationTokens,
} from "@/services/auth/cleanup";
import { hashToken } from "@/services/auth/session";
import {
  cleanupTestUsers,
  registerUnverifiedUserViaApi,
  uniqueEmail,
} from "../helpers/auth-fixtures";

describe("verification hardening", () => {
  describe("cleanupExpiredVerificationTokens", () => {
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

    it("removes expired verification tokens", async () => {
      const registered = await registerUnverifiedUserViaApi(app, "OWNER");
      userIds.push(registered.userId);

      await db.query(
        `
          UPDATE email_verification_tokens
          SET expires_at = now() - interval '1 minute'
          WHERE user_id = $1
        `,
        [registered.userId],
      );

      const result = await cleanupExpiredVerificationTokens();

      expect(result.deletedCount).toBeGreaterThanOrEqual(1);

      const remaining = await db.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM email_verification_tokens
          WHERE user_id = $1
        `,
        [registered.userId],
      );

      expect(Number(remaining.rows[0]?.count ?? 0)).toBe(0);
    });

    it("preserves active verification tokens", async () => {
      const registered = await registerUnverifiedUserViaApi(app, "CLIENT");
      userIds.push(registered.userId);

      const before = await db.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM email_verification_tokens
          WHERE user_id = $1
            AND verified_at IS NULL
            AND expires_at > now()
        `,
        [registered.userId],
      );

      expect(Number(before.rows[0]?.count ?? 0)).toBe(1);

      const result = await cleanupExpiredVerificationTokens();

      expect(result.deletedCount).toBe(0);

      const after = await db.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM email_verification_tokens
          WHERE user_id = $1
            AND verified_at IS NULL
            AND expires_at > now()
        `,
        [registered.userId],
      );

      expect(Number(after.rows[0]?.count ?? 0)).toBe(1);
    });

    it("removes consumed tokens older than retention", async () => {
      const email = uniqueEmail("consumed-cleanup");
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

      await db.query(
        `
          INSERT INTO email_verification_tokens (
            user_id,
            token,
            expires_at,
            verified_at
          )
          VALUES (
            $1,
            $2,
            now() + interval '1 day',
            now() - interval '8 days'
          )
        `,
        [userId, hashToken("999999")],
      );

      const result = await cleanupExpiredVerificationTokens();

      expect(result.deletedCount).toBeGreaterThanOrEqual(1);

      const remaining = await db.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM email_verification_tokens
          WHERE user_id = $1
        `,
        [userId],
      );

      expect(Number(remaining.rows[0]?.count ?? 0)).toBe(0);
    });
  });

  describe("account-level rate limiting", () => {
    async function buildRateLimitApp(preset: "authVerifyEmail" | "authVerificationResend") {
      const app = Fastify();
      await app.register(rateLimit, { global: false });

      app.post(
        "/test",
        { config: { rateLimit: buildEmailRateLimitConfig(preset) } },
        async () => ({ success: true }),
      );

      await app.ready();
      return app;
    }

    it("throttles verify-email attempts per email", async () => {
      const app = await buildRateLimitApp("authVerifyEmail");
      const email = "throttle-verify@propie.test";

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const response = await app.inject({
          method: "POST",
          url: "/test",
          payload: { email, code: "000000" },
        });

        expect(response.statusCode).toBe(200);
      }

      const blocked = await app.inject({
        method: "POST",
        url: "/test",
        payload: { email, code: "000000" },
      });

      expect(blocked.statusCode).toBe(429);

      const otherEmail = await app.inject({
        method: "POST",
        url: "/test",
        payload: { email: "other@propie.test", code: "000000" },
      });

      expect(otherEmail.statusCode).toBe(200);

      await app.close();
    });

    it("throttles verification resend per email", async () => {
      const app = await buildRateLimitApp("authVerificationResend");
      const email = "throttle-resend@propie.test";

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const response = await app.inject({
          method: "POST",
          url: "/test",
          payload: { email },
        });

        expect(response.statusCode).toBe(200);
      }

      const blocked = await app.inject({
        method: "POST",
        url: "/test",
        payload: { email },
      });

      expect(blocked.statusCode).toBe(429);

      await app.close();
    });
  });

  describe("E2E_CAPTURE_VERIFICATION production safety", () => {
    it("is disabled in production even when the env flag is set", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("E2E_CAPTURE_VERIFICATION", "true");

      expect(isE2eCaptureVerificationEnabled()).toBe(false);

      vi.unstubAllEnvs();
    });

    it("fails startup when enabled in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("E2E_CAPTURE_VERIFICATION", "true");

      expect(() => assertE2eCaptureVerificationSafe()).toThrow(
        /E2E_CAPTURE_VERIFICATION cannot be enabled/,
      );

      vi.unstubAllEnvs();
    });

    it("allows capture outside production when explicitly enabled", () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("E2E_CAPTURE_VERIFICATION", "true");

      expect(isE2eCaptureVerificationEnabled()).toBe(true);

      vi.unstubAllEnvs();
    });
  });
});
