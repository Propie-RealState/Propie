import { request } from "node:https";

const base = process.env.VERCEL_BASE_URL ?? "https://propie-weld.vercel.app";

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
            wire: Buffer.concat(chunks).length,
            encoding: res.headers["content-encoding"] ?? "-",
            cache: res.headers["cache-control"] ?? "-",
          });
        });
      },
    ).end();
  });
}

const html = await (await fetch(`${base}/`)).text();
const cssPaths = [
  ...new Set(
    [...html.matchAll(/"(\/assets\/[^"]+\.css)"/g)].map((m) => m[1]),
  ),
];

// Lazy CSS chunks referenced from main JS
const mainJs = [...html.matchAll(/"(\/assets\/[^"]+\.js)"/g)].map((m) => m[1])[0];
if (mainJs) {
  const mainText = await (await fetch(`${base}${mainJs}`)).text();
  for (const match of mainText.matchAll(/\/assets\/[A-Za-z0-9._-]+\.css/g)) {
    cssPaths.push(match[0]);
  }
}

const targets = [...new Set(cssPaths)];

console.log("# CSS on Vercel — compression + cache\n");
console.log("file | accept | encoding | wire-bytes | cache-control");

for (const path of targets) {
  for (const accept of ["br", "identity"]) {
    const row = await probe(path, accept);
    console.log(
      `${row.path} | ${row.accept} | ${row.encoding} | ${row.wire} | ${row.cache}`,
    );
  }
}
