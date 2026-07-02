const BRAND = "rgb(68, 23, 230)";

export type PropieLogoProps = {
  size?: number;
  /**
   * `onHero`: white wordmark on gradient/dark backgrounds.
   * `inline`: colored mark for light backgrounds.
   */
  variant?: "onHero" | "inline";
};

export function PropieLogo({ size = 46, variant = "onHero" }: PropieLogoProps) {
  const fill = variant === "onHero" ? "#ffffff" : BRAND;
  const height = Math.max(28, size * 0.72);
  const width = Math.min(260, size * 4);

  return (
    <svg
      viewBox="0 0 200 72"
      width={width}
      height={height}
      role="img"
      aria-label="Propie"
      style={{ display: "block", height, width: "auto", maxWidth: width }}
    >
      <text
        x="100"
        y="50"
        textAnchor="middle"
        fill={fill}
        fontFamily="'Montserrat', 'Inter', system-ui, sans-serif"
        fontSize="40"
        fontWeight="800"
        letterSpacing="-0.02em"
      >
        Propie
      </text>
    </svg>
  );
}
