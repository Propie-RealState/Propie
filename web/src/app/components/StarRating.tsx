import React from "react";
import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  totalReviews?: number;
  size?: number;
  showCount?: boolean;
  compact?: boolean;
};

export function StarRating({
  rating,
  totalReviews,
  size = 14,
  showCount = true,
  compact = false,
}: StarRatingProps) {
  const displayRating = rating > 0 ? rating.toFixed(1) : null;

  if (!displayRating) {
    if (compact) return null;
    return (
      <span style={{ fontSize: size - 2, color: "#9a9aa0" }}>
        Sin reseñas
      </span>
    );
  }

  const filled = Math.round(rating);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 2 : 4,
      }}
    >
      {!compact && (
        <span style={{ display: "inline-flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={size}
              color="#f59e0b"
              fill={n <= filled ? "#f59e0b" : "none"}
            />
          ))}
        </span>
      )}

      {compact && (
        <Star
          size={size}
          color="#f59e0b"
          fill="#f59e0b"
          style={{ flexShrink: 0 }}
        />
      )}

      <span
        style={{
          fontSize: size,
          fontWeight: 700,
          color: "#1a1a1a",
          lineHeight: 1,
        }}
      >
        {displayRating}
      </span>

      {showCount && totalReviews !== undefined && (
        <span
          style={{
            fontSize: size - 2,
            color: "#6e6e73",
            fontWeight: 400,
          }}
        >
          ({totalReviews})
        </span>
      )}
    </span>
  );
}
