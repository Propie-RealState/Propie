const targets = [
  ["API /properties", "https://propie-api.onrender.com/properties"],
  ["API /health", "https://propie-api.onrender.com/health"],
  ["Vercel /", "https://propie-weld.vercel.app/"],
  ["Vercel manifest", "https://propie-weld.vercel.app/manifest.webmanifest"],
];

async function probe(name, url) {
  const first = await fetch(url, { headers: { "Accept-Encoding": "identity" } });
  const body = await first.text();
  const etag = first.headers.get("etag");
  const lastModified = first.headers.get("last-modified");

  let conditional = "-";
  if (etag) {
    const second = await fetch(url, {
      headers: { "If-None-Match": etag, "Accept-Encoding": "identity" },
    });
    conditional = `${second.status}${second.status === 304 ? " (304)" : ""}`;
  } else if (lastModified) {
    const second = await fetch(url, {
      headers: {
        "If-Modified-Since": lastModified,
        "Accept-Encoding": "identity",
      },
    });
    conditional = `${second.status}${second.status === 304 ? " (304)" : ""}`;
  }

  return {
    name,
    status: first.status,
    etag: etag ?? "-",
    lastModified: lastModified ?? "-",
    conditional,
    bytes: body.length,
  };
}

const html = await (await fetch("https://propie-weld.vercel.app/")).text();
const js = [...html.matchAll(/"(\/assets\/[^"]+\.js)"/g)].map((m) => m[1])[0];
if (js) targets.push(["Vercel /assets/*.js", `https://propie-weld.vercel.app${js}`]);

console.log("# ETag / Last-Modified verification\n");
console.log("target | status | ETag | Last-Modified | conditional revalidation");

for (const [name, url] of targets) {
  const row = await probe(name, url);
  console.log(
    `${row.name} | ${row.status} | ${row.etag} | ${row.lastModified} | ${row.conditional}`,
  );
}

console.log("\n# Expected for this stack");
console.log("- API JSON routes: typically no ETag/Last-Modified (Cache-Control based caching)");
console.log("- Vercel static: may send ETag from CDN; hashed /assets/* rely on immutable Cache-Control");
