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
    updateData({ role: "AGENT" });
    syncUserTypeFromRole("AGENT");
    navigate("/registro/verification");
  };

  const handleSocialLogin = (provider: string) => {
    updateData({ role: "AGENT" });
    syncUserTypeFromRole("AGENT");
    console.log(`Login con ${provider}`);
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
        <div style={{ position: "absolute", width: 300, height: 300, background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)", top: -80, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 180, height: 180, background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", bottom: 40, left: -40, pointerEvents: "none" }} />

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
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 280 }}>
            Empezá a conectar propietarios con compradores
          </p>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => handleSocialLogin("Google")} type="button" style={{ width: "100%", background: "white", border: "1.5px solid #e5e5ea", borderRadius: 16, padding: "14px 18px", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
              Continuar con Google
            </button>
            <button onClick={() => handleSocialLogin("Apple")} type="button" style={{ width: "100%", background: "#000", border: "1.5px solid #000", borderRadius: 16, padding: "14px 18px", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "white" }}>
              Continuar con Apple
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
            <span style={{ fontSize: 13, color: "#9a9aa0", fontWeight: 500 }}>o</span>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
          </div>

          <AccountCreationForm
            data={data}
            updateData={updateData}
            theme={{ primary: theme.primary, focusShadow: "0 0 0 3px rgba(197,46,62,0.08)" }}
            onValidSubmit={handleValidSubmit}
            registrationKind="agent"
          />
        </div>
      </div>
    </div>
  );
}
