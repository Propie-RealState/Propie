import type { CSSProperties } from "react";

const shimmer: CSSProperties = {
  background: "linear-gradient(90deg, #ececef 25%, #f5f5f7 50%, #ececef 75%)",
  backgroundSize: "200% 100%",
  animation: "propie-skeleton-shimmer 1.2s ease-in-out infinite",
  borderRadius: 14,
};

export function PublishMediaGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Cargando fotos y videos"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          style={{
            ...shimmer,
            aspectRatio: "1",
          }}
        />
      ))}
    </div>
  );
}
