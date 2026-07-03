import { resolveMediaUrl } from "../api-base";
import { appendMediaToken } from "./media-url";
import { buildImageSrcSet } from "./responsive-media";

// ============================================================
// CANONICAL MEDIA DTO
// ============================================================
// Single source of truth for how property media is represented on the client.
// Every media consumer (publish wizard, edit, cards, gallery, details) should
// derive its view from `MediaAsset` rather than reaching into raw API rows.

export type MediaType = "image" | "video";

export interface MediaAsset {
  id: string;
  type: MediaType;
  /** Full-resolution, ready-to-render URL (tokenized when required). */
  url: string;
  /** Thumbnail URL; falls back to `url` when no thumbnail exists. */
  thumbUrl: string;
  /** Responsive srcset when thumb and full URLs differ. */
  srcSet?: string;
  isCover: boolean;
  displayOrder: number;
}

/** Shape of a media row as returned by the properties API. */
export interface RawMediaRow {
  id: string;
  type?: MediaType;
  image_url?: string | null;
  video_url?: string | null;
  thumb_url?: string | null;
  is_cover?: boolean;
  display_order?: number;
}

export interface RawMediaSource {
  media?: RawMediaRow[];
  images?: RawMediaRow[];
  videos?: RawMediaRow[];
}

function rowType(row: RawMediaRow): MediaType {
  if (row.type) {
    return row.type;
  }

  return row.video_url ? "video" : "image";
}

function sourceUrl(row: RawMediaRow, type: MediaType): string | null {
  return type === "image" ? row.image_url ?? null : row.video_url ?? null;
}

/**
 * Builds the canonical, ordered media list from a property payload.
 * `token` (a media capability token) is appended to each URL when provided so
 * owner/draft media renders through the authenticated proxy.
 */
export function buildMediaAssets(
  source: RawMediaSource,
  token: string | null = null,
): MediaAsset[] {
  const rows: RawMediaRow[] = source.media?.length
    ? [...source.media]
    : [
        ...(source.images ?? []).map((image) => ({
          ...image,
          type: "image" as const,
        })),
        ...(source.videos ?? []).map((video) => ({
          ...video,
          type: "video" as const,
        })),
      ];

  return rows
    .map((row, index) => {
      const type = rowType(row);
      const full = appendMediaToken(resolveMediaUrl(sourceUrl(row, type)), token) ?? "";
      const thumb =
        type === "image"
          ? appendMediaToken(resolveMediaUrl(row.thumb_url), token) ?? full
          : full;

      return {
        id: row.id,
        type,
        url: full,
        thumbUrl: thumb,
        srcSet: type === "image" ? buildImageSrcSet(full, thumb) : undefined,
        isCover: type === "image" ? Boolean(row.is_cover) : false,
        displayOrder: row.display_order ?? index,
      } satisfies MediaAsset;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
