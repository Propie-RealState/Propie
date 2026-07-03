import { request } from "node:https";

const base = process.env.VERCEL_BASE_URL ?? "https://propie-weld.vercel.app";

const paths = [
  "/logo.png",
  "/brand/logo-home-heade2r.png",
  "/brand/logo-home-header1.png",
  "/ISOLOGO.png",
  "/pwa-512x512.png",
  "/pwa-192x192.png",
  "/apple-touch-icon-180x180.png",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/manifest.webmanifest",
  "/logo.svg",
];

function probe(path, acceptEncoding) {
  return new Promise((resolve) => {
    request(
      `${base}${path}`,
      { headers: { "Accept-Encoding": acceptEncoding } },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            path,
            accept: acceptEncoding,
            status: res.statusCode ?? 0,
            wire: Buffer.concat(chunks).length,
            encoding: res.headers["content-encoding"] ?? "-",
            type: (res.headers["content-type"] ?? "-").split(";")[0],
            cache: res.headers["cache-control"] ?? "-",
          });
        });
      },
    ).end();
  });
}

console.log("# Static assets on Vercel — compression + cache\n");
console.log(
  "file | status | compressed | encoding | wire | raw | cache-control",
);

for (const path of paths) {
  const br = await probe(path, "br");
  const raw = await probe(path, "identity");
  const compressed =
    br.encoding !== "-" && br.wire < raw.wire
      ? "yes"
      : br.encoding !== "-"
        ? "header-only"
        : "no";
  const savings =
    raw.wire > 0 && br.wire < raw.wire
      ? `${Math.round((1 - br.wire / raw.wire) * 100)}%`
      : "-";

  console.log(
    `${path} | ${raw.status} | ${compressed} | ${br.encoding} | ${br.wire} | ${raw.wire} | ${raw.cache}${savings !== "-" ? ` | -${savings}` : ""}`,
  );
}

console.log("\n# SPA rewrite check (non-existent static path)");
const fake = await probe("/does-not-exist.png", "identity");
console.log(
  `/does-not-exist.png | ${fake.status} | - | ${fake.encoding} | ${fake.wire} | ${fake.type} | ${fake.cache}`,
);
