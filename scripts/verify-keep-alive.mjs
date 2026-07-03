import { Agent as HttpsAgent, request as httpsRequest } from "node:https";
import { Agent as HttpAgent, request as httpRequest } from "node:http";

function probe(url, label) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? httpsRequest : httpRequest;
    lib(url, { method: "GET", headers: { "Accept-Encoding": "identity" } }, (res) => {
      res.resume();
      resolve({
        label,
        status: res.statusCode ?? 0,
        httpVersion: res.httpVersion,
        connection: res.headers.connection ?? "-",
        keepAlive: res.headers["keep-alive"] ?? "-",
      });
    }).on("error", (err) =>
      resolve({ label, error: err.message }),
    ).end();
  });
}

function probeReuse(url, label, count = 3) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? httpsRequest : httpRequest;
    const agent = url.startsWith("https")
      ? new HttpsAgent({ keepAlive: true })
      : new HttpAgent({ keepAlive: true });
    const timings = [];
    let i = 0;

    const run = () => {
      const started = performance.now();
      lib(
        url,
        { method: "HEAD", agent, headers: { Connection: "keep-alive" } },
        (res) => {
          res.resume();
          res.on("end", () => {
            timings.push(Math.round(performance.now() - started));
            i += 1;
            if (i < count) run();
            else {
              agent.destroy();
              resolve({ label, timings, agentKeepAlive: true });
            }
          });
        },
      ).on("error", (err) => {
        agent.destroy();
        resolve({ label, error: err.message });
      }).end();
    };

    run();
  });
}

const targets = [
  ["API /health", "https://propie-api.onrender.com/health"],
  ["API /properties", "https://propie-api.onrender.com/properties"],
  ["Vercel /", "https://propie-weld.vercel.app/"],
];

console.log("# Keep-Alive verification\n");
console.log("## Response headers\n");
console.log("target | status | HTTP | Connection | Keep-Alive");

for (const [label, url] of targets) {
  const row = await probe(url, label);
  if (row.error) {
    console.log(`${label} | ERR | ${row.error}`);
    continue;
  }
  console.log(
    `${label} | ${row.status} | ${row.httpVersion} | ${row.connection} | ${row.keepAlive}`,
  );
}

console.log("\n## Sequential requests (client keepAlive agent)\n");
console.log("target | req1 | req2 | req3 | note");

for (const [label, url] of targets) {
  const row = await probeReuse(url, label);
  if (row.error) {
    console.log(`${label} | ERR | ${row.error}`);
    continue;
  }
  const [a, b, c] = row.timings;
  const note = b < a * 0.8 || c < a * 0.8 ? "likely reused" : "inconclusive";
  console.log(`${label} | ${a}ms | ${b}ms | ${c}ms | ${note}`);
}

console.log("\n## Notes");
console.log("- HTTP/2 (common on Vercel) multiplexes on one connection; Connection header may be absent.");
console.log("- Fastify/Node defaults to keep-alive on HTTP/1.1 unless Connection: close.");
