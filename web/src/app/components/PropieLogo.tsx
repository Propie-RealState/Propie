/** Raster export from brand PDF (`public/brand/logo-full-color.png`). */
const LOGO_SRC = "/brand/logo-full-color.png";

export type PropieLogoProps = {
  size?: number;
  /**
   * `onHero`: light pill behind full-color mark (headers con gradiente).
   * `inline`: solo la imagen, para fondos claros.
   */
  variant?: "onHero" | "inline";
};

export function PropieLogo({ size = 46, variant = "onHero" }: PropieLogoProps) {
  const img = (
    <img
      src={LOGO_SRC}
      alt="propie"
      width={undefined}
      height={undefined}
      decoding="async"
      style={{
        height: Math.max(22, size * 0.52),
        width: "auto",
        maxWidth: Math.min(200, size * 4),
        display: "block",
        objectFit: "contain",
        objectPosition: "left center",
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
        padding: "6px 12px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.96)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      {img}
    </div>
  );
}

/** Misma marca en fondo claro (sin pastilla). */
export function PropieLogoDark({ size = 46 }: { size?: number }) {
  return <PropieLogo size={size} variant="inline" />;
}
