import type { CSSProperties } from "react";

/** Full-height page shell used across tabbed screens */
export const pageShellStyle: CSSProperties = {
  height: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  background: "#f5f5f7",
  fontFamily: "'Inter', sans-serif",
};

/** Scrollable main content region inside a page shell */
export const pageScrollStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

/** Sticky page header used on detail screens */
export const pageHeaderStyle: CSSProperties = {
  flexShrink: 0,
  background: "white",
  borderBottom: "1px solid #e5e5ea",
  padding: "16px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  zIndex: 10,
};

/** Safe-area aware sticky bottom CTA bar */
export const stickyCtaPadding =
  "16px 20px max(16px, env(safe-area-inset-bottom))";

export const modalBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding:
    "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
  background: "rgba(0,0,0,0.5)",
};

export const modalPanelStyle: CSSProperties = {
  width: "100%",
  maxWidth: 480,
  maxHeight:
    "calc(90dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
  overflowX: "hidden",
  overflowY: "auto",
  borderRadius: 20,
  background: "white",
  padding: "24px",
  WebkitOverflowScrolling: "touch",
};
