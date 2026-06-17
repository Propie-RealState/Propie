import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { AppModal } from "../layout/AppModal";
import { useAppTheme } from "../../../theme/useAppTheme";
import { useAuth } from "../../../context/AuthContext";
import { dismissAgentProfileBanner } from "../../modules/profile/services/profile.service";
import {
  snoozeAgentBannerForSession,
  type AgentCompletionSummary,
} from "../../../lib/agent-profile-completion";

type Props = {
  userId: string;
  summary: AgentCompletionSummary;
  onSnooze: () => void;
  onPermanentDismiss: () => void;
};

export function AgentProfileCompletionBanner({
  userId,
  summary,
  onSnooze,
  onPermanentDismiss,
}: Props) {
  const navigate = useNavigate();
  const theme = useAppTheme();
  const { refreshUser } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savingDismiss, setSavingDismiss] = useState(false);

  async function dismissPermanently() {
    if (savingDismiss) return;
    setSavingDismiss(true);
    try {
      await dismissAgentProfileBanner();
      onPermanentDismiss();
      setConfirmOpen(false);
      await refreshUser();
    } finally {
      setSavingDismiss(false);
    }
  }

  return (
    <>
      <div
        data-testid="agent-profile-banner"
        style={{
          margin: "16px 16px 12px",
          padding: "14px 14px 14px 16px",
          borderRadius: 16,
          background: theme.lightBg,
          border: `1px solid rgba(${theme.rgb}, 0.16)`,
          boxShadow: `0 2px 10px rgba(${theme.rgb}, 0.08)`,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
            Completá tu perfil profesional
          </p>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#4b4b52", lineHeight: 1.5 }}>
            Más visibilidad, más confianza y más oportunidades de asignación.
          </p>
          <button
            type="button"
            data-testid="agent-profile-banner-cta"
            onClick={() => navigate("/perfil")}
            style={{
              background: theme.primary,
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: theme.buttonShadow,
            }}
          >
            Completar perfil
          </button>
        </div>
        <button
          type="button"
          data-testid="agent-profile-banner-close"
          aria-label="Cerrar banner"
          onClick={() => setConfirmOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: theme.primaryDark,
          }}
        >
          <X size={18} />
        </button>
      </div>

      <AppModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="¿Cerrar recordatorio?">
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#4b4b52", lineHeight: 1.5 }}>
          Podés completar tu perfil cuando quieras desde la sección Perfil.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            data-testid="agent-banner-remind-later"
            onClick={() => {
              snoozeAgentBannerForSession(userId);
              setConfirmOpen(false);
              onSnooze();
            }}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #e5e5ea",
              background: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recordarme más tarde
          </button>
          <button
            type="button"
            data-testid="agent-banner-dont-show"
            disabled={savingDismiss}
            onClick={() => void dismissPermanently()}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              background: "#f5f5f7",
              fontWeight: 600,
              cursor: savingDismiss ? "wait" : "pointer",
              opacity: savingDismiss ? 0.7 : 1,
            }}
          >
            No mostrar de nuevo
          </button>
        </div>
      </AppModal>
    </>
  );
}
