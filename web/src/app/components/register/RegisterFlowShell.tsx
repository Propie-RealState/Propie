import React, { type ReactNode } from "react";
import { AuthHeroHeader } from "../AuthHeroHeader";

type Props = {
  title: string;
  subtitle: string;
  heroGradient?: string;
  children: ReactNode;
};

const DEFAULT_GRADIENT =
  "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)";

export function RegisterFlowShell({
  title,
  subtitle,
  heroGradient = DEFAULT_GRADIENT,
  children,
}: Props) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          background: heroGradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingBottom: 0,
        }}
      >
        <AuthHeroHeader />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "32px 28px 12px",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: "clamp(26px, 7vw, 34px)",
              fontWeight: 800,
              letterSpacing: "-1.2px",
              lineHeight: 1.15,
              fontFamily: "'Sora', sans-serif",
              margin: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 14,
              marginTop: 10,
              lineHeight: 1.6,
              maxWidth: 300,
            }}
          >
            {subtitle}
          </p>
        </div>
        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg
            viewBox="0 0 390 44"
            preserveAspectRatio="none"
            style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}
          >
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>{children}</div>
      </div>
    </div>
  );
}
