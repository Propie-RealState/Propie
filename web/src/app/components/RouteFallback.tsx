import React from "react";

/**
 * Neutral, layout-stable fallback shown while a lazy route chunk loads.
 * Fills the available height with the app background plus a subtle spinner so
 * navigation never flashes a blank frame or shifts layout.
 */
export function RouteFallback() {
  return (
    <div
      role="status"
      aria-label="Cargando"
      style={{
        flex: 1,
        minHeight: 0,
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "#f5f5f7",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "3px solid rgba(68,23,230,0.18)",
          borderTopColor: "#4417E6",
          display: "inline-block",
          animation: "propie-route-spin 0.7s linear infinite",
        }}
      />
      <style>{"@keyframes propie-route-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
