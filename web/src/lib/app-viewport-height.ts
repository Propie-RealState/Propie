/** Pixels — visual viewport shrink typical of mobile virtual keyboard. */
export const APP_VIEWPORT_KEYBOARD_THRESHOLD_PX = 150;

export const APP_HEIGHT_CSS_VAR = "--app-height";

let lastStableHeightPx = 0;

export function resolveAppViewportHeight(): number {
  return Math.round(window.visualViewport?.height ?? window.innerHeight);
}

export function isKeyboardLikelyOpen(): boolean {
  const visualViewport = window.visualViewport;
  if (!visualViewport) {
    return false;
  }

  return (
    window.innerHeight - visualViewport.height >
    APP_VIEWPORT_KEYBOARD_THRESHOLD_PX
  );
}

export function applyAppViewportHeight(heightPx: number): void {
  document.documentElement.style.setProperty(
    APP_HEIGHT_CSS_VAR,
    `${heightPx}px`,
  );
}

/** Sets `--app-height` once, respecting keyboard guard when a prior value exists. */
export function syncAppViewportHeight(): void {
  if (isKeyboardLikelyOpen() && lastStableHeightPx > 0) {
    return;
  }

  lastStableHeightPx = resolveAppViewportHeight();
  applyAppViewportHeight(lastStableHeightPx);
}

/** Run before React paint to avoid a stale `100dvh` flash on iOS PWA reload. */
export function bootstrapAppViewportHeight(): void {
  lastStableHeightPx = resolveAppViewportHeight();
  applyAppViewportHeight(lastStableHeightPx);
}

export function subscribeAppViewportHeight(): () => void {
  const sync = () => syncAppViewportHeight();

  const syncAfterOrientation = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(sync);
    });
  };

  const visualViewport = window.visualViewport;

  window.addEventListener("resize", sync);
  window.addEventListener("orientationchange", syncAfterOrientation);
  window.addEventListener("pageshow", sync);
  visualViewport?.addEventListener("resize", sync);

  return () => {
    window.removeEventListener("resize", sync);
    window.removeEventListener("orientationchange", syncAfterOrientation);
    window.removeEventListener("pageshow", sync);
    visualViewport?.removeEventListener("resize", sync);
  };
}
