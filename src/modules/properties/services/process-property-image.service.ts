import sharp from "sharp";

const FULL_MAX_WIDTH = 1920;
const THUMB_WIDTH = 400;
const WEBP_QUALITY = 82;
const THUMB_WEBP_QUALITY = 75;

export interface ProcessedImage {
  fullBuffer: Buffer;
  thumbBuffer: Buffer;
}

/**
 * Convert a raw image buffer to two WebP variants:
 *   - full:  max 1920 px wide, quality 82
 *   - thumb: max  400 px wide, quality 75
 *
 * Both preserve aspect ratio and never upscale.
 * Full and thumb are encoded concurrently (Promise.all) from the same input buffer.
 * The caller's for-await loop ensures only one image is processed per request at a time.
 */
export async function processPropertyImage(
  rawBuffer: Buffer,
): Promise<ProcessedImage> {
  const base = sharp(rawBuffer).rotate();

  const [fullBuffer, thumbBuffer] = await Promise.all([
    base
      .clone()
      .resize({ width: FULL_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer(),

    base
      .clone()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_WEBP_QUALITY })
      .toBuffer(),
  ]);

  return { fullBuffer, thumbBuffer };
}
