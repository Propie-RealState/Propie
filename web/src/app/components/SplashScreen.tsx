"use client";

import { motion } from "motion/react";

const BRAND = "rgb(68, 23, 230)";
const EXIT_MS = 750;
/** Brief progress bar — no artificial multi-second hold */
export const LOADER_MS = 400;

function SplashLogo() {
  return (
    <svg
      viewBox="0 0 200 72"
      width={200}
      height={72}
      role="img"
      aria-label="Propie"
      className="block h-auto w-[min(52vw,200px)] max-w-[200px]"
    >
      <text
        x="100"
        y="50"
        textAnchor="middle"
        fill={BRAND}
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

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: EXIT_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[38%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(68, 23, 230, 0.12)" }}
        />
      </div>

      <motion.div
        className="relative z-10 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <SplashLogo />
      </motion.div>

      <div
        className="relative mt-14 h-1.5 w-[min(48vw,168px)] overflow-hidden rounded-full md:mt-16"
        style={{ backgroundColor: "rgba(68, 23, 230, 0.1)" }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 w-full origin-left rounded-full"
          style={{ backgroundColor: BRAND }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: LOADER_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </motion.div>
  );
}
