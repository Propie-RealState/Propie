/** App-wide logo (`web/public/logo.png`) — same asset as SplashScreen */
export const PROPIE_LOGO_SRC = "/logo.png";

export type PropieLogoProps = {
  size?: number;
  /**
   * `onHero`: light pill behind mark (headers on gradient/dark backgrounds).
   * `inline`: logo only, for light backgrounds.
   */
  variant?: "onHero" | "inline";
};

export function PropieLogo({ size = 46, variant = "onHero" }: PropieLogoProps) {
  const img = (
    <img
      src={PROPIE_LOGO_SRC}
      alt="Propie"
      width={200}
      height={72}
      decoding="async"
      style={{
        height: Math.max(24, size * 0.62),
        width: "auto",
        maxWidth: Math.min(220, size * 3.5),
        display: "block",
        objectFit: "contain",
        objectPosition: "center",
      }}
    />
  );

  if (variant === "inline") {
    return img;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: size >= 52 ? "8px 18px" : "6px 12px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.96)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      {img}
    </div>
  );
}
