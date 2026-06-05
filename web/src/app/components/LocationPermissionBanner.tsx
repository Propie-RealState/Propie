import { MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { createPortal } from "react-dom";

import { PROPIE_THEME } from "@/theme/app-theme";

type Props = {
  open: boolean;
  loading?: boolean;
  onActivate: () => void;
  onDismiss: () => void;
};

export function LocationPermissionBanner({
  open,
  loading = false,
  onActivate,
  onDismiss,
}: Props) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="location-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          style={{
            position: "fixed",
            bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
            left: 12,
            right: 12,
            zIndex: 9998,
            borderRadius: 16,
            background: "#ffffff",
            boxShadow:
              "0 8px 32px rgba(68,23,230,0.18), 0 2px 8px rgba(0,0,0,0.08)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: PROPIE_THEME.lightBgSolid,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MapPin size={22} color={PROPIE_THEME.primary} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: 14,
                color: "#111",
              }}
            >
              Activá tu ubicación
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>
              Recibí avisos cuando publiquen propiedades cerca tuyo
            </p>
          </div>

          <button
            type="button"
            onClick={onActivate}
            disabled={loading}
            style={{
              flexShrink: 0,
              background: PROPIE_THEME.primary,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "..." : "Activar"}
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar"
            disabled={loading}
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              cursor: loading ? "default" : "pointer",
              padding: 4,
              color: "#999",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
