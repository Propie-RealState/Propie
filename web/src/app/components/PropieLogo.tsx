/** Splash / light backgrounds */
export const PROPIE_LOGO_SRC = "/logo.png";

/** White wordmark for hero headers (register, publish, login) */
export const PROPIE_LOGO_HERO_SRC = "/LOGO%20B.png";

export type PropieLogoProps = {
  size?: number;
  /**
   * `onHero`: white wordmark on gradient/dark backgrounds (no pill).
   * `inline`: colored mark for light backgrounds.
   */
  variant?: "onHero" | "inline";
};

export function PropieLogo({ size = 46, variant = "onHero" }: PropieLogoProps) {
  const src = variant === "onHero" ? PROPIE_LOGO_HERO_SRC : PROPIE_LOGO_SRC;

  return (
    <img
      src={src}
      alt="Propie"
      width={200}
      height={72}
      decoding="async"
      style={{
        height: Math.max(28, size * 0.72),
        width: "auto",
        maxWidth: Math.min(260, size * 4),
        display: "block",
        objectFit: "contain",
        objectPosition: "center",
      }}
    />
  );
}
