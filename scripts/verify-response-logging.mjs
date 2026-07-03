import Fastify from "fastify";

const logs = [];

const app = Fastify({
  logger: {
    level: "info",
    stream: {
      write(chunk) {
        logs.push(String(chunk).trim());
      },
    },
  },
});

app.get("/health", async (_request, reply) => {
  reply.header("Cache-Control", "no-store");
  return reply.send({ status: "ok" });
});

await app.ready();
const res = await app.inject({ method: "GET", url: "/health" });
await app.close();

const combined = logs.join("\n");
const hasIncoming = combined.includes("incoming request");
const hasCompleted = combined.includes("request completed");
const hasResponseTime = /"responseTime":\d+/.test(combined);
const hasStatus = combined.includes('"statusCode":200') || combined.includes('"statusCode": 200');

console.log("# Response logging verification (Fastify/Pino)\n");
console.log(`inject status: ${res.statusCode}`);
console.log(`incoming request logged: ${hasIncoming ? "YES" : "NO"}`);
console.log(`request completed logged: ${hasCompleted ? "YES" : "NO"}`);
console.log(`responseTime present: ${hasResponseTime ? "YES" : "NO"}`);
console.log(`statusCode present: ${hasStatus ? "YES" : "NO"}`);
console.log("\n# sample log lines");
for (const line of logs.slice(0, 4)) {
  console.log(line);
}

const pass = hasIncoming && hasCompleted && hasResponseTime && hasStatus && res.statusCode === 200;
console.log(`\n# result: ${pass ? "PASS" : "FAIL"}`);
process.exit(pass ? 0 : 1);
