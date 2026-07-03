import { request } from "node:https";
import { gunzipSync, brotliDecompressSync } from "node:zlib";

const base = process.env.VERCEL_BASE_URL ?? "https://propie-weld.vercel.app";

function fetchRaw(url, acceptEncoding) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const req = request(
      url,
      {
        method: "GET",
        headers: {
          "Accept-Encoding": acceptEncoding,
          "User-Agent": "Propie-Vercel-Compression-Probe/1.0",
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const wire = Buffer.concat(chunks);
          const encoding = res.headers["content-encoding"] ?? "-";
          let decoded = wire.length;
          try {
            if (encoding === "gzip") decoded = gunzipSync(wire).length;
            else if (encoding === "br") decoded = brotliDecompressSync(wire).length;
            else decoded = wire.length;
          } catch {
            decoded = wire.length;
          }
          resolve({
            ms: Math.round(performance.now() - started),
            status: res.statusCode ?? 0,
            encoding,
            wire: wire.length,
            decoded,
            type: String(res.headers["content-type"] ?? "-").split(";")[0],
            cache: res.headers["cache-control"] ?? "-",
          });
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

const htmlRes = await fetch(`${base}/`, {
  headers: { "Accept-Encoding": "gzip, br" },
});
const html = await htmlRes.text();
const assets = [
  ...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g),
].map((m) => m[1]);

const targets = ["/", ...assets, "/sw.js", "/registerSW.js", "/logo.svg"];

console.log(`# base=${base}`);
console.log(
  "path | accept | status | content-encoding | wire-bytes | decoded-bytes | ratio | type",
);

for (const path of targets) {
  for (const accept of ["br", "gzip", "identity"]) {
    const row = await fetchRaw(`${base}${path}`, accept);
    const ratio =
      row.decoded > 0
        ? `${Math.round((1 - row.wire / row.decoded) * 100)}%`
        : "-";
    console.log(
      `${path} | ${accept} | ${row.status} | ${row.encoding} | ${row.wire} | ${row.decoded} | ${ratio} | ${row.type}`,
    );
  }
  console.log("");
}
