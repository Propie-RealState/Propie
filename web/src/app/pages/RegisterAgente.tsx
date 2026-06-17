import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { AGENT_THEME, syncUserTypeFromRole } from "../../theme/app-theme";
import { AccountCreationForm } from "../../features/register/components/AccountCreationForm";

const theme = AGENT_THEME;

export default function RegisterAgente() {
  const { data, updateData } = useRegister();
  const navigate = useNavigate();

  useEffect(() => {
    if (data.role !== "AGENT") {
      updateData({ role: "AGENT" });
    }
    syncUserTypeFromRole("AGENT");
  }, [data.role, updateData]);

  const handleValidSubmit = () => {
    updateData({ role: "AGENT", mainGoal: "EXPLORE" });
    syncUserTypeFromRole("AGENT");
    navigate("/registro/verification");
  };

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
        <AuthHeroHeader />

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
            Creá tu cuenta de agente
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Explorá oportunidades, completá tu perfil y solicitá propiedades para comercializar.
          </p>
        </div>

        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}>
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <AccountCreationForm
            data={data}
            updateData={updateData}
            theme={{ primary: theme.primary, focusShadow: "0 0 0 3px rgba(197,46,62,0.08)" }}
            onValidSubmit={handleValidSubmit}
            registrationKind="agent"
            minimal
          />
        </div>
      </div>
    </div>
  );
}
