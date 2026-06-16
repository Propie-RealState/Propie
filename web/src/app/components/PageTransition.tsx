"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import React from "react";

// Easing from the reference: smooth cinematic feel, slight ease-out spring
const EASE = [0.54, 0.35, 0.29, 0.99] as const;
const ENTER = { duration: 0.38, ease: EASE };
const EXIT  = { duration: 0.22, ease: EASE };

export function PageTransition() {
  const location     = useLocation();
  const navType      = useNavigationType();
  const reduceMotion = useReducedMotion();
  const isPop        = navType === "POP";

  // 6px forward, 4px back — barely perceptible, just adds physicality
  const enterY = isPop ? -6 : 6;
  const exitY  = isPop ?  6 : -4;

  return (
    <div
      className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden"
      style={{ height: "100%" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          className="flex h-full min-h-0 w-full flex-col overflow-hidden"
          style={{
            willChange: reduceMotion ? "auto" : "opacity, transform",
          }}
          initial={reduceMotion ? false : { opacity: 0, y: enterY }}
          animate={{ opacity: 1, y: 0, transition: reduceMotion ? { duration: 0 } : ENTER }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: exitY, transition: EXIT }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
