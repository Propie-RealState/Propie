import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { AccountCreationForm } from "../../features/register/components/AccountCreationForm";

type RegisterPropieProps = {
  registrationKind?: "owner" | "client";
};

const OWNER_THEME = {
  primary: "#4417E6",
  focusShadow: "0 0 0 3px rgba(68,23,230,0.08)",
};

export default function RegisterPropie({
  registrationKind = "owner",
}: RegisterPropieProps = {}) {
  const { data, updateData } = useRegister();
  const navigate = useNavigate();
  const isClientRegistration = registrationKind === "client";

  const handleValidSubmit = () => {
    if (isClientRegistration) {
      updateData({ role: "CLIENT", mainGoal: "EXPLORE" });
      sessionStorage.removeItem("userType");
    } else {
      updateData({ role: "OWNER" });
      sessionStorage.setItem("userType", "propie");
    }
    navigate("/registro/personal-data");
  };

  const handleSocialLogin = (provider: string) => {
    if (isClientRegistration) {
      updateData({ role: "CLIENT", mainGoal: "EXPLORE" });
      sessionStorage.removeItem("userType");
    } else {
      updateData({ role: "OWNER" });
      sessionStorage.setItem("userType", "propie");
    }
    console.log(`Login con ${provider}`, provider);
    navigate("/registro/personal-data");
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
          background: "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
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
            Crear cuenta
          </h1>
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
            <button
              onClick={() => handleSocialLogin("Google")}
              type="button"
              style={{
                width: "100%",
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "14px 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontSize: 15,
                fontWeight: 600,
                color: "#1a1a1a",
              }}
            >
              Continuar con Google
            </button>
            <button
              onClick={() => handleSocialLogin("Apple")}
              type="button"
              style={{
                width: "100%",
                background: "#000000",
                border: "1.5px solid #000000",
                borderRadius: 16,
                padding: "14px 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontSize: 15,
                fontWeight: 600,
                color: "white",
              }}
            >
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
            theme={OWNER_THEME}
            onValidSubmit={handleValidSubmit}
            registrationKind={registrationKind}
          />
        </div>
      </div>
    </div>
  );
}
