type ImageRow = {
  id: string;
  image_url: string;
  thumb_url?: string | null;
  is_cover?: boolean;
  display_order?: number;
};

type VideoRow = {
  id: string;
  video_url: string;
  display_order?: number;
};

export function toImageMediaDescriptor(row: ImageRow) {
  return {
    id: row.id,
    type: "image" as const,
    image_url: row.image_url,
    thumb_url: row.thumb_url ?? null,
    is_cover: Boolean(row.is_cover),
    display_order: row.display_order ?? 0,
  };
}

export function toVideoMediaDescriptor(row: VideoRow) {
  return {
    id: row.id,
    type: "video" as const,
    video_url: row.video_url,
    display_order: row.display_order ?? 0,
  };
}
