const base = process.env.VERCEL_BASE_URL ?? "https://propie-weld.vercel.app";

const html = await (await fetch(`${base}/`)).text();
const assets = [...html.matchAll(/"(\/assets\/[^"]+)"/g)].map((m) => m[1]);
console.log("# index.html assets", assets.join(", "));

const mainJs = assets.find((a) => a.endsWith(".js"));
if (mainJs) {
  const body = await (await fetch(`${base}${mainJs}`)).text();
  const chunks = [...body.matchAll(/\/assets\/[A-Za-z0-9._-]+\.js/g)].map((m) => m[0]);
  console.log("# dynamic chunks referenced", [...new Set(chunks)].slice(0, 10).join(", "));
}

for (const path of ["/", mainJs ?? "/assets/index-Cd4H-4OC.js", "/sw.js"]) {
  const res = await fetch(`${base}${path}`, {
    headers: { "Accept-Encoding": "br" },
  });
  console.log(
    `${path} | cache=${res.headers.get("cache-control")} | x-vercel-cache=${res.headers.get("x-vercel-cache")} | age=${res.headers.get("age")}`,
  );
}
