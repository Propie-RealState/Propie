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
  const [showSplash, setShowSplash] = useState(true);
  const [splashMounted, setSplashMounted] = useState(true);

  useEffect(() => {
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
  }, [navigate]);

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
    <div className="flex min-h-screen min-h-dvh w-full flex-col">
      {children}
      {splashLayer}
    </div>
  );
}
