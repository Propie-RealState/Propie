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
            status: res.statusCode ?? 0,
            wire: Buffer.concat(chunks).length,
            encoding: res.headers["content-encoding"] ?? "-",
            type: res.headers["content-type"] ?? "-",
            cache: res.headers["cache-control"] ?? "-",
          });
        });
      },
    ).end();
  });
}

const svgPaths = [
  "/logo.svg",
  "/vite.svg",
  "/assets/logo.svg",
];

console.log("# SVG on Vercel — compression + cache\n");
console.log(
  "file | status | accept | encoding | wire-bytes | content-type | cache-control",
);

for (const path of svgPaths) {
  for (const accept of ["br", "gzip", "identity"]) {
    const row = await probe(path, accept);
    if (row.status === 404 && accept !== "identity") continue;
    console.log(
      `${row.path} | ${row.status} | ${row.accept} | ${row.encoding} | ${row.wire} | ${row.type.split(";")[0]} | ${row.cache}`,
    );
  }
}
