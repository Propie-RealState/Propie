import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { createPortal } from "react-dom";

import { PROPIE_THEME } from "@/theme/app-theme";

type Props = {
  open: boolean;
  loading?: boolean;
  onAccept: () => void;
  onSkip: () => void;
};

export function LocationPermissionPrompt({
  open,
  loading = false,
  onAccept,
  onSkip,
}: Props) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="location-prompt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onSkip}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 10000,
            }}
          />
          <motion.div
            key="location-prompt-panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{
              position: "fixed",
              left: 16,
              right: 16,
              bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
              zIndex: 10001,
              background: "#ffffff",
              borderRadius: 20,
              padding: "22px 20px 18px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: PROPIE_THEME.lightBgSolid,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <MapPin size={24} color={PROPIE_THEME.primary} />
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Avisos de propiedades cerca tuyo
            </h2>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 14,
                lineHeight: 1.5,
                color: "#6e6e73",
              }}
            >
              Usamos tu ubicación para avisarte cuando se publiquen propiedades
              en tu zona. Podés cambiar esto más adelante.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                onClick={onAccept}
                disabled={loading}
                style={{
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 16px",
                  background: PROPIE_THEME.primary,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Obteniendo ubicación..." : "Permitir ubicación"}
              </button>
              <button
                type="button"
                onClick={onSkip}
                disabled={loading}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#6e6e73",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  padding: "8px 0",
                }}
              >
                Ahora no
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
