/**
 * Regenerate all PWA icons from public/ISOLOGO.png
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

const src = path.resolve(__dirname, "../public/ISOLOGO.png");
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

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

async function renderIcon({ file, size }) {
  const isMaskable = file.includes("maskable");
  const contentRatio = isMaskable ? 0.72 : 0.88;
  const contentSize = Math.round(size * contentRatio);

  await sharp(src)
    .resize(contentSize, contentSize, {
      fit: "contain",
      background: transparent,
    })
    .extend({
      top: Math.floor((size - contentSize) / 2),
      bottom: Math.ceil((size - contentSize) / 2),
      left: Math.floor((size - contentSize) / 2),
      right: Math.ceil((size - contentSize) / 2),
      background: transparent,
    })
    .png()
    .toFile(path.join(outDir, file));
}

for (const icon of icons) {
  await renderIcon(icon);
  console.log("?", icon.file);
}

console.log("\nAll PWA icons generated successfully.");
