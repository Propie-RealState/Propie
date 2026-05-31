/**
 * Regenerate all PWA icons from public/logo.svg
 * Run: pnpm generate-pwa-icons
 */
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve sharp from the pnpm virtual store
let sharp;
try {
  sharp = require("sharp");
} catch {
  // Fallback to the pnpm internal path
  const sharpPath = path.resolve(
    __dirname,
    "../node_modules/.pnpm/sharp@0.33.5/node_modules/sharp"
  );
  sharp = require(sharpPath);
}

const src = path.resolve(__dirname, "../public/logo.svg");
const outDir = path.resolve(__dirname, "../public");

const icons = [
  { file: "pwa-64x64.png", size: 64 },
  { file: "pwa-192x192.png", size: 192 },
  { file: "pwa-512x512.png", size: 512 },
  { file: "maskable-icon-512x512.png", size: 512 },
  { file: "apple-touch-icon-180x180.png", size: 180 },
  { file: "favicon-32x32.png", size: 32 },
  { file: "favicon.ico", size: 32 },
];

for (const { file, size } of icons) {
  await sharp(src).resize(size, size).png().toFile(path.join(outDir, file));
  console.log("?", file);
}

console.log("\nAll PWA icons generated successfully.");
