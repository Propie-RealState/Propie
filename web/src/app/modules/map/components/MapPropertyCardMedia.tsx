import React, { memo } from "react";
import { Building2 } from "lucide-react";

type Props = {
  coverImage: string | null;
  alt: string;
};

export const MapPropertyCardMedia = memo(
  function MapPropertyCardMedia({
    coverImage,
    alt,
  }: Props) {
    if (coverImage) {
      return (
        <div className="propie-map-sheet-card-media">
          <img
            alt={alt}
            className="propie-map-sheet-card-image"
            decoding="async"
            loading="lazy"
            src={coverImage}
          />
        </div>
      );
    }

    return (
      <div
        aria-hidden
        className="propie-map-sheet-card-media propie-map-sheet-card-media--placeholder"
      >
        <Building2 size={28} strokeWidth={1.6} />
      </div>
    );
  },
);
