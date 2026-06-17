import React, { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { REGISTER_COMPLETION } from "../register/registerCompletionTheme";

type Props = {
  open: boolean;
  onExplore: () => void;
  onPublish: () => void;
};

export function OwnerWelcomeModal({ open, onExplore, onPublish }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const theme = REGISTER_COMPLETION.OWNER;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="owner-welcome-modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          "max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))",
        background: "rgba(15, 12, 28, 0.52)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          borderRadius: 24,
          padding: "32px 28px 28px",
          background: theme.gradient,
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 18px",
            borderRadius: "50%",
            border: `3px solid ${theme.ring}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.12)",
          }}
        >
          <Check size={36} strokeWidth={2.6} color="white" />
        </div>
        <h2
          id={titleId}
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: "white",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          ¡Tu cuenta está lista!
        </h2>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 15,
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.88)",
          }}
        >
          ¿Qué querés hacer ahora?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
          <button
            type="button"
            data-testid="owner-welcome-publish"
            onClick={onPublish}
            style={{
              width: "100%",
              padding: "15px 18px",
              borderRadius: 14,
              border: "none",
              background: "white",
              color: theme.primary,
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Publicar mi primera propiedad
          </button>
          <button
            type="button"
            data-testid="owner-welcome-explore"
            onClick={onExplore}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.12)",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Explorar propiedades
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
