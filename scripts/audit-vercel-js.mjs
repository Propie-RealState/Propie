const base = process.env.VERCEL_BASE_URL ?? "https://propie-weld.vercel.app";

const html = await (await fetch(`${base}/`)).text();
const mainJs =
  [...html.matchAll(/"(\/assets\/[^"]+\.js)"/g)].map((m) => m[1])[0] ?? null;

const mainText = mainJs
  ? await (await fetch(`${base}${mainJs}`)).text()
  : "";

const lazyJs = [
  ...mainText.matchAll(/\/assets\/[A-Za-z0-9._-]+\.js/g),
].map((m) => m[0]);

const targets = [
  mainJs,
  "/sw.js",
  "/registerSW.js",
  ...lazyJs,
].filter(Boolean);

console.log("# Determine whether JS is compressed + cached on Vercel\n");
console.log("file | compressed | encoding | wire | raw | cache-control");

for (const path of [...new Set(targets)]) {
  for (const accept of ["br", "identity"]) {
    const res = await fetch(`${base}${path}`, {
      headers: { "Accept-Encoding": accept },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const encoding = res.headers.get("content-encoding") ?? "-";
    const cache = res.headers.get("cache-control") ?? "-";
    const compressed = encoding !== "-" ? "yes" : "no";
    if (accept === "br") {
      console.log(
        `${path} | ${compressed} | ${encoding} | ${buf.length} | (see identity row) | ${cache}`,
      );
    } else {
      console.log(`${path} | — | - | — | ${buf.length} | ${cache}`);
    }
  }
}
