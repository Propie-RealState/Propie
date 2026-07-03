import { request } from "node:https";

function probe(url, acceptEncoding) {
  return new Promise((resolve, reject) => {
    request(
      url,
      {
        headers: {
          "Accept-Encoding": acceptEncoding,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            url,
            accept: acceptEncoding,
            status: res.statusCode ?? 0,
            wire: Buffer.concat(chunks).length,
            encoding: res.headers["content-encoding"] ?? "-",
            type: (res.headers["content-type"] ?? "-").split(";")[0],
            cache: res.headers["cache-control"] ?? "-",
          });
        });
      },
    ).on("error", reject).end();
  });
}

const base = process.env.VERCEL_BASE_URL ?? "https://propie-weld.vercel.app";

console.log("# Fonts — compression + cache\n");
console.log("## Vercel (self-hosted)\n");
console.log("No .woff/.woff2 in repo or dist — fonts are NOT served from Vercel.\n");

const vercelFontPaths = [
  "/fonts",
  "/assets/inter.woff2",
  "/Inter.woff2",
];

console.log("file | status | encoding | wire | cache");
for (const path of vercelFontPaths) {
  const row = await probe(`${base}${path}`, "br");
  console.log(
    `${path} | ${row.status} | ${row.encoding} | ${row.wire} | ${row.type} | ${row.cache}`,
  );
}

console.log("\n## Google Fonts CDN\n");

const cssUrls = [
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&display=swap",
  "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap",
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap",
];

const woff2Urls = new Set();

for (const cssUrl of cssUrls) {
  const cssRes = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  const css = await cssRes.text();
  for (const match of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)) {
    woff2Urls.add(match[1]);
  }
  console.log(
    `CSS ${new URL(cssUrl).searchParams.get("family")?.split(":")[0] ?? cssUrl} | status=${cssRes.status} | cache=${cssRes.headers.get("cache-control") ?? "-"} | bytes=${css.length}`,
  );
}

console.log("\nfile | accept | encoding | wire | raw | cache");
const sample = [...woff2Urls].slice(0, 6);
for (const url of sample) {
  for (const accept of ["br", "identity"]) {
    const row = await probe(url, accept);
    console.log(
      `${new URL(url).pathname.split("/").pop()} | ${row.accept} | ${row.encoding} | ${row.wire} | ${accept === "identity" ? row.wire : "(see identity)"} | ${row.cache}`,
    );
  }
}

console.log(`\n# Total gstatic woff2 files referenced: ${woff2Urls.size}`);
