import { chromium } from "@playwright/test";

const base = process.env.WEB_BASE_URL ?? "http://127.0.0.1:5173";
const routes = ["/explorar", "/mapa", "/ingresar", "/registro"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
await context.addInitScript(() => {
  sessionStorage.setItem("propie_skip_splash", "1");
  sessionStorage.setItem("pwa-install-dismissed", "1");
  sessionStorage.setItem("propie_geo_banner_dismissed", "1");
  localStorage.setItem("propie_geo_prompt_shown", "1");
  localStorage.setItem("propie_geo_status", "skipped");
});

console.log(`# Console errors — ${base}\n`);
console.log("viewport | route | errors");

let totalErrors = 0;

for (const viewport of viewports) {
  const page = await context.newPage();
  await page.setViewportSize({ width: viewport.width, height: viewport.height });

  for (const route of routes) {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

    await page.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const unique = [...new Set(errors)];
    totalErrors += unique.length;
    console.log(
      `${viewport.name} | ${route} | ${unique.length}${unique.length ? `: ${unique.slice(0, 2).join(" | ")}` : ""}`,
    );
  }

  await page.close();
}

await browser.close();
console.log(`\n# total unique error events: ${totalErrors}`);
process.exit(totalErrors > 0 ? 1 : 0);
