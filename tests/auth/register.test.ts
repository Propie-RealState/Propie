import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  buildRegisterPayload,
  cleanupTestUsers,
  registerUserViaApi,
  uniqueEmail,
} from "../helpers/auth-fixtures";

describe("auth register", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const userIds: string[] = [];

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it.each(["OWNER", "AGENT", "CLIENT"] as const)(
    "registers a %s and auto-logs in",
    async (role) => {
      const registered = await registerUserViaApi(app, role);
      userIds.push(registered.userId);

      expect(registered.accessToken).toEqual(expect.any(String));
      expect(registered.refreshToken).toEqual(expect.any(String));

      const row = await db.query<{ role: string; email: string }>(
        `SELECT role, email FROM users WHERE id = $1`,
        [registered.userId],
      );

      expect(row.rows[0].role).toBe(role);
      expect(row.rows[0].email).toBe(registered.email);
    },
  );

  it("rejects duplicate email", async () => {
    const email = uniqueEmail("duplicate");
    const first = await registerUserViaApi(app, "OWNER", { email });
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
});
