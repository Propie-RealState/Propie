import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupTestUsers,
  registerUserViaApi,
  TEST_PASSWORD,
  loginViaApi,
  uniqueEmail,
} from "../helpers/auth-fixtures";

describe("auth login", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  const userIds: string[] = [];

  beforeAll(async () => {
    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    userIds.push(owner.userId);
  });

  afterAll(async () => {
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("logs in with valid credentials and returns tokens", async () => {
    await db.query(`DELETE FROM sessions WHERE user_id = $1`, [owner.userId]);

    const response = await loginViaApi(app, owner.email, owner.password);

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.accessToken.split(".")).toHaveLength(3);
    expect(body.data.refreshToken).toEqual(expect.any(String));
    expect(body.data.user.email).toBe(owner.email);
    expect(body.data.user.role).toBe("OWNER");

    const meResponse = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: `Bearer ${body.data.accessToken}` },
    });

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json().data.email).toBe(owner.email);
  });

  it("rejects invalid password", async () => {
    const response = await loginViaApi(app, owner.email, "WrongPass1!");

    expect(response.statusCode).toBe(401);

    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("LOGIN_ERROR");
  });

  it("rejects unknown email", async () => {
    const response = await loginViaApi(
      app,
      uniqueEmail("unknown"),
      TEST_PASSWORD,
    );

    expect(response.statusCode).toBe(401);
  });

  it("rejects missing credentials", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {},
    });

    expect(response.statusCode).toBe(401);
  });

  it("blocks non-owners from owner-only routes", async () => {
    const client = await registerUserViaApi(app, "CLIENT");
    userIds.push(client.userId);

    const ownerOnlyResponse = await app.inject({
      method: "GET",
      url: "/auth/owner-only",
      headers: { authorization: `Bearer ${client.accessToken}` },
    });

    expect(ownerOnlyResponse.statusCode).toBe(403);
  });

  it("allows owners on owner-only routes", async () => {
    const ownerOnlyResponse = await app.inject({
      method: "GET",
      url: "/auth/owner-only",
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(ownerOnlyResponse.statusCode).toBe(200);
    expect(ownerOnlyResponse.json().success).toBe(true);
  });

  it("rejects protected routes without a token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/auth/me",
    });

    expect(response.statusCode).toBe(401);
  });
});
