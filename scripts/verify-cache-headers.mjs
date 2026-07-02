const checks = [
  ["API /health", "https://propie-api.onrender.com/health", "no-store"],
  ["API /properties", "https://propie-api.onrender.com/properties", "max-age=60"],
  ["Vercel /", "https://propie-weld.vercel.app/", "max-age=0"],
  [
    "Vercel manifest",
    "https://propie-weld.vercel.app/manifest.webmanifest",
    "max-age=86400",
  ],
];

const html = await (await fetch("https://propie-weld.vercel.app/")).text();
const js = [...html.matchAll(/"(\/assets\/[^"]+\.js)"/g)].map((m) => m[1])[0];
if (js) {
  checks.push([
    "Vercel /assets/*.js",
    `https://propie-weld.vercel.app${js}`,
    "immutable",
  ]);
}

console.log("# Cache headers — production vs branch config\n");
console.log("target | status | cache-control | expected | match");

for (const [name, url, expect] of checks) {
  const res = await fetch(url, { method: "HEAD" });
  const cache = res.headers.get("cache-control") ?? "-";
  const match = cache.includes(expect) ? "YES" : "NO";
  console.log(`${name} | ${res.status} | ${cache} | ${expect} | ${match}`);
}

console.log("\n# Branch config review (code)");
console.log("API helpers -> docs/public-cache-headers.md: wired in controllers");
console.log("vercel.json /assets/* -> immutable 1y");
console.log("vercel.json icons/manifest -> max-age=86400");
