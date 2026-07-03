const base = process.env.VERCEL_BASE_URL ?? "https://propie-weld.vercel.app";

const paths = [
  "/",
  "/explorar",
  "/mapa",
  "/manifest.webmanifest",
  "/sw.js",
  "/registerSW.js",
  "/assets/index-Cd4H-4OC.js",
];

async function head(path) {
  const res = await fetch(`${base}${path}`, {
    method: "HEAD",
    redirect: "manual",
    headers: { "Accept-Encoding": "gzip, br" },
  });
  const pick = (name) => res.headers.get(name) ?? "-";
  console.log(
    [
      path,
      res.status,
      pick("content-type").split(";")[0],
      pick("content-encoding"),
      pick("cache-control"),
      pick("strict-transport-security"),
      pick("x-content-type-options"),
      pick("x-frame-options"),
      pick("content-security-policy"),
    ].join(" | "),
  );
}

console.log(
  "path | status | type | encoding | cache-control | hsts | x-content-type | x-frame | csp",
);
for (const path of paths) {
  await head(path);
}
