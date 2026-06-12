import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { describe, expect, it } from "vitest";

describe("rate limiting", () => {
  it("returns 429 after exceeding the configured limit", async () => {
    const app = Fastify();

    await app.register(rateLimit, {
      max: 2,
      timeWindow: "1 minute",
    });

    app.get("/limited", async () => ({ ok: true }));

    await app.ready();

    expect((await app.inject({ method: "GET", url: "/limited" })).statusCode).toBe(
      200,
    );
    expect((await app.inject({ method: "GET", url: "/limited" })).statusCode).toBe(
      200,
    );

    const blocked = await app.inject({
      method: "GET",
      url: "/limited",
    });

    expect(blocked.statusCode).toBe(429);

    await app.close();
  });
});
