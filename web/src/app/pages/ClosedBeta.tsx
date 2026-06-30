import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { pageScrollStyle, pageShellStyle } from "../components/layout/layout-styles";

export default function ClosedBeta() {
  const navigate = useNavigate();

  return (
    <div style={pageShellStyle}>
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          background: "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingBottom: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)",
            top: -80,
            right: -60,
            pointerEvents: "none",
          }}
        />
        <AuthHeroHeader onBack={() => navigate("/explorar")} showRegisterProgress={false} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "32px 28px 12px",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: "clamp(26px, 7vw, 34px)",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Beta cerrada
          </h1>
        </div>
      </div>

      <div
        style={{
          ...pageScrollStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 24px 48px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "white",
            borderRadius: 20,
            padding: "32px 28px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#3a3a40",
              fontSize: 15,
              lineHeight: 1.65,
              textAlign: "center",
            }}
          >
            Propie se encuentra actualmente en una beta privada. Estamos incorporando
            usuarios por invitación para garantizar la mejor experiencia.
          </p>
          <p
            style={{
              margin: "16px 0 0",
              color: "#3a3a40",
              fontSize: 15,
              lineHeight: 1.65,
              textAlign: "center",
            }}
          >
            Si recibiste una invitación, contactá al equipo de Propie para activar tu cuenta.
          </p>

          <button
            type="button"
            onClick={() => navigate("/ingresar")}
            style={{
              width: "100%",
              marginTop: 28,
              padding: "14px 24px",
              background: "#4417E6",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(68,23,230,0.24)",
            }}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
