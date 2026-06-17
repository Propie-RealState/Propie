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

const COPY = {
  owner: {
    title: "Creá tu cuenta de propietario",
    subtitle: "En minutos publicás tu propiedad y empezás a recibir consultas.",
  },
  client: {
    title: "Creá tu cuenta",
    subtitle: "Guardá favoritos, chateá con publicadores y agendá visitas.",
  },
} as const;

export default function RegisterPropie({
  registrationKind = "owner",
}: RegisterPropieProps = {}) {
  const { data, updateData } = useRegister();
  const navigate = useNavigate();
  const isClientRegistration = registrationKind === "client";
  const copy = isClientRegistration ? COPY.client : COPY.owner;

  const handleValidSubmit = () => {
    if (isClientRegistration) {
      updateData({ role: "CLIENT", mainGoal: "EXPLORE" });
      sessionStorage.removeItem("userType");
    } else {
      updateData({ role: "OWNER", mainGoal: "PUBLISH" });
      sessionStorage.setItem("userType", "propie");
    }
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
          background: "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
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
            {copy.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            {copy.subtitle}
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
            theme={OWNER_THEME}
            onValidSubmit={handleValidSubmit}
            registrationKind={registrationKind}
            minimal
          />
        </div>
      </div>
    </div>
  );
}
