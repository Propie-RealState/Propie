#!/usr/bin/env node
/**
 * Propie API latency baseline probe.
 *
 * Output format (one line per endpoint):
 *   GET /properties 182 ms
 *   POST /login 41 ms
 *
 * Rules:
 * - No authorization headers
 * - No tokens
 * - POST /login uses an empty body (400 is expected; measure round-trip only)
 */

const baseUrl = (process.env.PERF_BASE_URL ?? "https://propie-api.onrender.com").replace(
  /\/$/,
  "",
);

const endpoints = [
  { method: "GET", path: "/health" },
  { method: "GET", path: "/properties" },
  { method: "POST", path: "/auth/login", label: "/login" },
];

async function probe({ method, path, label }) {
  const url = `${baseUrl}${path}`;
  const started = performance.now();

  try {
    await fetch(url, {
      method,
      headers: method === "POST" ? { "content-type": "application/json" } : undefined,
      body: method === "POST" ? "" : undefined,
    });
  } catch {
    // Still record elapsed time when the service is unreachable.
  }

  const ms = Math.round(performance.now() - started);
  const displayPath = label ?? path;
  console.log(`${method} ${displayPath} ${ms} ms`);
}

console.log(`# base=${baseUrl}`);
console.log(`# date=${new Date().toISOString()}`);
console.log(`# rules=no-auth,no-tokens,login-empty-body`);

for (const endpoint of endpoints) {
  await probe(endpoint);
}
