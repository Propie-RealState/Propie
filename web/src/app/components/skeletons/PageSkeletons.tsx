import React from "react";

const shimmer: React.CSSProperties = {
  background: "linear-gradient(90deg, #ececef 25%, #f5f5f7 50%, #ececef 75%)",
  backgroundSize: "200% 100%",
  animation: "propie-skeleton-shimmer 1.2s ease-in-out infinite",
  borderRadius: 12,
};

function Block({
  height,
  width = "100%",
  radius = 12,
}: {
  height: number;
  width?: number | string;
  radius?: number;
}) {
  return (
    <div
      style={{
        ...shimmer,
        height,
        width,
        borderRadius: radius,
      }}
    />
  );
}

export function ExplorePageSkeleton() {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
      <Block height={48} radius={16} />
      <div style={{ display: "flex", gap: 8 }}>
        <Block height={36} width={88} radius={20} />
        <Block height={36} width={88} radius={20} />
        <Block height={36} width={88} radius={20} />
      </div>
      <Block height={280} radius={28} />
      <Block height={280} radius={28} />
    </div>
  );
}

export function PropertyListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 20 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Block key={index} height={120} radius={16} />
      ))}
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "22px 20px" }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Block key={index} height={88} radius={20} />
      ))}
    </div>
  );
}

export function FavoritesPageSkeleton() {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <Block height={280} radius={28} />
      <Block height={280} radius={28} />
    </div>
  );
}
