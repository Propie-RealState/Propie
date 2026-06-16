"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import SplashScreen, { LOADER_MS } from "../components/SplashScreen";

/** Wait for loader to reach 100% + brief hold */
const SPLASH_MIN_MS = LOADER_MS + 200;
const EXIT_UNMOUNT_MS = 850;
const EXPLORE_PATH = "/explore";

type Props = {
  children: ReactNode;
};

export default function AppStartup({ children }: Props) {
  const navigate = useNavigate();
  const skipSplash =
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem("propie_skip_splash") === "1";
  const [showSplash, setShowSplash] = useState(!skipSplash);
  const [splashMounted, setSplashMounted] = useState(!skipSplash);

  useEffect(() => {
    if (skipSplash) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (!cancelled) {
        setShowSplash(false);
        navigate(EXPLORE_PATH, { replace: true });
      }
    }, SPLASH_MIN_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [navigate, skipSplash]);

  useEffect(() => {
    if (showSplash) {
      return;
    }

    const fallback = window.setTimeout(() => {
      setSplashMounted(false);
    }, EXIT_UNMOUNT_MS);

    return () => window.clearTimeout(fallback);
  }, [showSplash]);

  const splashLayer =
    splashMounted && typeof document !== "undefined"
      ? createPortal(
          <div
            aria-hidden={!showSplash}
            style={{ pointerEvents: showSplash ? "auto" : "none" }}
          >
            <AnimatePresence onExitComplete={() => setSplashMounted(false)}>
              {showSplash ? <SplashScreen key="splash" /> : null}
            </AnimatePresence>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {children}
      {splashLayer}
    </div>
  );
}
