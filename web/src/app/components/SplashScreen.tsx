"use client";

import { motion } from "motion/react";

import { PROPIE_LOGO_SRC } from "./PropieLogo";

const BRAND = "rgb(68, 23, 230)";
const EXIT_MS = 750;
/** Bar fill duration — keep in sync with AppStartup SPLASH_MIN_MS */
export const LOADER_MS = 2000;

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#FAFAFA]"
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
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={PROPIE_LOGO_SRC}
          alt="Propie"
          width={200}
          height={72}
          decoding="async"
          className="block h-auto w-[min(52vw,200px)] max-w-[200px] object-contain"
        />
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
        <div
          className="absolute inset-0 animate-[splash-shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"
          style={{ width: "55%" }}
        />
      </div>
    </motion.div>
  );
}
