import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublishWizardCTA } from "../components/PublishWizardCTA";
import { PublishWizardLayout } from "../components/PublishWizardLayout";
import { ShieldCheck, Users, XCircle } from "lucide-react";
import React from "react";
import {
  savePropertyCommercialization,
} from "../services/save-property-commercialization.ts";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { usePropertyPublish } from "../context/PropertyPublishContext";

type CommercializationType = "AGENTS" | "DIRECT";

export default function PublishStep4() {
  const theme = useAppTheme();

  const navigate = useNavigate();
  const {
    data,
    updateData,
  } = usePropertyPublish();

  const [
    commercializationType,

    setCommercializationType,
  ] =
    useState<
      CommercializationType | null
    >(null);
  const [manualApproval, setManualApproval] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const isFormValid = Boolean(commercializationType);

  const continueHint =
    showValidation && !isFormValid
      ? "Elegí una opción de comercialización."
      : undefined;

  const handleContinueAttempt = () => {
    if (!isFormValid) {
      setShowValidation(true);
      return;
    }

    void handleContinue();
  };

  const handleContinue =
    async () => {

      if (
        !commercializationType
      ) {
        return;
      }

      if (
        !data.propertyId
      ) {
        return;
      }

      try {

        updateData({
          commercializationType,
        });

        await savePropertyCommercialization({
          propertyId: data.propertyId,
          commercializationType,
          manualApproval,
        });

        navigate(
          "/publicar/revision"
        );

      } catch (error) {

        console.error(
          "Save commercialization failed",
          error
        );
      }
    };

  const commercializationOptions = [
    {
      id: "AGENTS" as CommercializationType,

      title: "Aceptar agentes",

      desc:
        "Agentes independientes pueden promocionar tu propiedad",

      icon:
        <Users
          size={24}
          color={theme.primary}
          strokeWidth={2}
        />,
    },

    {
      id: "DIRECT" as CommercializationType,

      title:
        "Sin intermediarios",

      desc:
        "Gestiono todo directamente sin ayuda externa",

      icon:
        <XCircle
          size={24}
          color={theme.primary}
          strokeWidth={2}
        />,
    },
  ];

  return (
    <PublishWizardLayout
      title="Comercialización"
      subtitle="Elegí cómo querés gestionar tu propiedad"
      footer={
        <PublishWizardCTA
          label="Continuar"
          onClick={handleContinueAttempt}
          hint={continueHint}
        />
      }
    >
          {/* Commercialization options */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
              Opciones de comercialización
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {commercializationOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setCommercializationType(option.id)}
                  style={{
                    width: "100%",
                    background: "white",
                    border: commercializationType === option.id ? `2px solid ${theme.primary}` : "2px solid transparent",
                    borderRadius: 16,
                    padding: "18px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    transition: "all 0.15s ease",
                    boxShadow: commercializationType === option.id ? "0 4px 16px rgba(197,46,62,0.15)" : "0 1px 6px rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    if (commercializationType !== option.id) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (commercializationType !== option.id) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)";
                    }
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: commercializationType === option.id ? "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)" : "#f8f8f8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {option.icon}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
                      {option.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2, lineHeight: 1.4 }}>
                      {option.desc}
                    </div>
                  </div>
                  {commercializationType === option.id && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: theme.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {commercializationType === "AGENTS" && (
            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: "20px 18px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                border: `1px solid ${manualApproval ? `${theme.primary}22` : "#ececf0"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: manualApproval
                      ? "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)"
                      : "#f5f5f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={22} color={theme.primary} strokeWidth={2} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#1f1f25",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    Gestión de agentes
                  </h3>
                  <p
                    style={{
                      margin: "0 0 14px",
                      fontSize: 13,
                      color: "#6e6e73",
                      lineHeight: 1.5,
                    }}
                  >
                    Definí si los agentes pueden sumarse automáticamente o si
                    preferís revisar cada solicitud antes de aprobarla.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      paddingTop: 12,
                      borderTop: "1px solid #f0f0f2",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        Aprobación manual
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6e6e73",
                          marginTop: 2,
                        }}
                      >
                        Revisá y aprobá cada agente manualmente
                      </div>
                    </div>
                    <label
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: 48,
                        height: 28,
                        flexShrink: 0,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={manualApproval}
                        onChange={(e) => setManualApproval(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        aria-label="Aprobación manual de agentes"
                      />
                      <span
                        style={{
                          position: "absolute",
                          cursor: "pointer",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: manualApproval ? theme.primary : "#e5e5ea",
                          transition: "0.3s",
                          borderRadius: 28,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            height: 22,
                            width: 22,
                            left: manualApproval ? 23 : 3,
                            bottom: 3,
                            background: "white",
                            transition: "0.3s",
                            borderRadius: "50%",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        />
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info box */}
          {commercializationType === "DIRECT" && (
            <div
              style={{
                background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <p style={{ margin: 0, fontSize: 13, color: theme.primary, lineHeight: 1.6, fontWeight: 500 }}>
                💡 Vas a gestionar todas las consultas y visitas de forma directa
              </p>
            </div>
          )}

    </PublishWizardLayout>
  );
}
