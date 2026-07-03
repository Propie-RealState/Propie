/** Default `sizes` for explore grid cards (2-column mobile, ~280px desktop cell). */
export const CARD_IMAGE_SIZES =
  "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px";

/** Default `sizes` for property detail gallery / hero. */
export const GALLERY_IMAGE_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px";

/** Default `sizes` for large property cards. */
export const HERO_CARD_IMAGE_SIZES =
  "(max-width: 768px) 100vw, 520px";

/**
 * Builds a srcset when a thumbnail and full URL are available.
 * Returns `undefined` when responsive sources would not help.
 */
export function buildImageSrcSet(
  fullUrl: string,
  thumbUrl?: string | null,
): string | undefined {
  const thumb = thumbUrl?.trim();

  if (!thumb || thumb === fullUrl) {
    return undefined;
  }

  return `${thumb} 480w, ${fullUrl} 1600w`;
}

/**
 * Picks the best default `src` — prefer the thumbnail for list/card contexts.
 */
export function pickDisplaySrc(
  fullUrl: string,
  thumbUrl?: string | null,
): string {
  return thumbUrl?.trim() || fullUrl;
}
