import { useEffect } from "react";

import {
  bootstrapAppViewportHeight,
  subscribeAppViewportHeight,
} from "../lib/app-viewport-height";

/**
 * Keeps `--app-height` in sync with the visible viewport for `#root`.
 * Complements the inline bootstrap in `index.html` (pre-paint) with
 * runtime listeners for resize, orientation, PWA resume, and keyboard guard.
 */
export function useAppViewportHeight(): void {
  useEffect(() => {
    bootstrapAppViewportHeight();
    return subscribeAppViewportHeight();
  }, []);
}
