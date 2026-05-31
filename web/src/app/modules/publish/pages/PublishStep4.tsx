import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../../../components/AuthHeroHeader";
import { ArrowLeft, Users, Building2, UserCheck, XCircle } from "lucide-react";
import React from "react";
import {
  savePropertyCommercialization,
} from "../services/save-property-commercialization.ts";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { usePropertyPublish } from "../context/PropertyPublishContext";

type CommercializationType =
  | "AGENTS"
  | "AGENCIES"
  | "BOTH"
  | "DIRECT";

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
  const [allowChat, setAllowChat] = useState(true);
  const [sharedCalendar, setSharedCalendar] = useState(false);

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

        await savePropertyCommercialization(
          {
            propertyId:
              data.propertyId,

            commercializationType,

            manualApproval,

            allowChat,

            sharedCalendar,
          }
        );

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
      id: "AGENCIES" as CommercializationType,

      title:
        "Aceptar inmobiliarias",

      desc:
        "Inmobiliarias registradas pueden gestionar tu propiedad",

      icon:
        <Building2
          size={24}
          color={theme.primary}
          strokeWidth={2}
        />,
    },

    {
      id: "BOTH" as CommercializationType,

      title: "Ambos",

      desc:
        "Tanto agentes como inmobiliarias pueden participar",

      icon:
        <UserCheck
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
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── HERO ── */}
      <div
        style={{
          position: "relative",
          background: theme.heroGradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingBottom: 0,
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", width: 300, height: 300, background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)", top: -80, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 180, height: 180, background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", bottom: 40, left: -40, pointerEvents: "none" }} />

        <AuthHeroHeader />

        {/* Heading */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 28px 12px" }}>
          <h1
            style={{
              color: "white",
              fontSize: "clamp(26px, 7vw, 34px)",
              fontWeight: 800,
              letterSpacing: "-1.2px",
              lineHeight: 1.15,
              fontFamily: "'Sora', sans-serif",
              margin: 0,
            }}
          >
            Comercialización
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Elegí cómo querés gestionar tu propiedad
          </p>
        </div>

        {/* Wave */}
        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}>
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 40px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 24 }}>
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

          {/* Settings toggles */}
          {commercializationType && commercializationType !== "DIRECT" && (
            <div>
              <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
                Configuración
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Manual approval */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "16px 18px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                      Aprobación manual
                    </div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                      Revisá y aprobá cada agente manualmente
                    </div>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: 48, height: 28, flexShrink: 0, marginLeft: 12 }}>
                    <input
                      type="checkbox"
                      checked={manualApproval}
                      onChange={(e) => setManualApproval(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
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
                          content: "",
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

                {/* Show chats */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "16px 18px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                      Mostrar chats
                    </div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                      Permitir comunicación directa con interesados
                    </div>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: 48, height: 28, flexShrink: 0, marginLeft: 12 }}>
                    <input
                      type="checkbox"
                      checked={allowChat}
                      onChange={(e) => setAllowChat(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: allowChat ? theme.primary : "#e5e5ea",
                        transition: "0.3s",
                        borderRadius: 28,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: "",
                          height: 22,
                          width: 22,
                          left: allowChat ? 23 : 3,
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

                {/* Shared calendar */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "16px 18px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                      Agenda compartida
                    </div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                      Los agentes pueden agendar visitas directamente
                    </div>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: 48, height: 28, flexShrink: 0, marginLeft: 12 }}>
                    <input
                      type="checkbox"
                      checked={sharedCalendar}
                      onChange={(e) => setSharedCalendar(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: sharedCalendar ? theme.primary : "#e5e5ea",
                        transition: "0.3s",
                        borderRadius: 28,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: "",
                          height: 22,
                          width: 22,
                          left: sharedCalendar ? 23 : 3,
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

          {/* Continue button */}
          <button
            onClick={handleContinue}

            disabled={
              !commercializationType
            }

            style={{
              width: "100%",

              height: 56,

              border: "none",

              borderRadius: 18,

              fontSize: 18,

              fontWeight: 700,

              cursor:
                commercializationType
                  ? "pointer"
                  : "not-allowed",

              background:
                commercializationType
                  ? theme.primary
                  : "#d9d9df",

              color: "white",

              transition:
                "all 0.15s ease",

              marginTop: 24,
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
