import { useState, type ImgHTMLAttributes } from "react";
import { ImageIcon } from "lucide-react";

import {
  buildImageSrcSet,
  pickDisplaySrc,
} from "./responsive-media";

type ResponsiveImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet"
> & {
  src: string;
  thumbSrc?: string | null;
  sizes?: string;
};

/**
 * Renders an image with optional thumb + full srcset and a graceful fallback.
 */
export function ResponsiveImage({
  src,
  thumbSrc,
  sizes,
  loading = "lazy",
  decoding = "async",
  onError,
  style,
  ...rest
}: ResponsiveImageProps) {
  const [failed, setFailed] = useState(false);
  const srcSet = failed ? undefined : buildImageSrcSet(src, thumbSrc);

  if (failed || !src) {
    return (
      <div
        aria-hidden
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f2",
          color: "#9a9aa0",
          ...style,
        }}
      >
        <ImageIcon size={28} strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <img
      {...rest}
      src={pickDisplaySrc(src, thumbSrc)}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      loading={loading}
      decoding={decoding}
      style={style}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
