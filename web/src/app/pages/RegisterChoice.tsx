import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { Home, Briefcase, Search, ChevronRight } from "lucide-react";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
export default function RegisterChoice() {
  const navigate = useNavigate();
  const { updateData } = useRegister();
  function handleOwnerSelect() {
    updateData({
      role: "OWNER",
    });
  
    navigate("/registro/owner");
  }
  
  function handleAgentSelect() {
    updateData({
      role: "AGENT",
    });
  
    navigate("/registro/agent");
  }

  function handleClientSelect() {
    updateData({
      role: "CLIENT",
      mainGoal: "EXPLORE",
    });

    navigate("/registro/client");
  }
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ── HERO ── */}
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
              maxWidth: 300,
            }}
          >
            ¿Cómo vas a usar Propie?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 260 }}>
            Elegí tu rol para personalizar tu experiencia
          </p>
        </div>
      </div>

      {/* ── CARDS ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 24px 40px",
          gap: 16,
        }}
      >
        {/* Propie card */}
        <button
          onClick={handleOwnerSelect}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "white",
            border: "2px solid transparent",
            borderRadius: 24,
            padding: "26px 22px",
            cursor: "pointer",
            textAlign: "left",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            transition: "all 0.18s ease",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#4417E6";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(68,23,230,0.16)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          {/* Icon */}
          <div style={{ width: 60, height: 60, borderRadius: 20, background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(68,23,230,0.12)" }}>
            <Home size={26} color="#4417E6" strokeWidth={1.8} />
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.5px" }}>
              Soy dueño
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#6e6e73", lineHeight: 1.55 }}>
              Tenés un inmueble y querés publicarlo directamente, sin intermediarios.
            </p>
          </div>

          {/* Arrow */}
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ChevronRight size={16} color="#4417E6" />
          </div>
        </button>

        {/* Explorador (CLIENT) */}
        <button
          onClick={handleClientSelect}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "white",
            border: "2px solid transparent",
            borderRadius: 24,
            padding: "26px 22px",
            cursor: "pointer",
            textAlign: "left",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            transition: "all 0.18s ease",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#C52E3E";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(197,46,62,0.14)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          <div style={{ width: 60, height: 60, borderRadius: 20, background: "linear-gradient(135deg, #fff6f0 0%, #ffe8d6 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(197,46,62,0.10)" }}>
            <Search size={26} color="#C52E3E" strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.5px" }}>
              Quiero explorar
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#6e6e73", lineHeight: 1.55 }}>
              Buscá propiedades, guardá favoritos y contactá publicadores.
            </p>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "#fff6f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ChevronRight size={16} color="#C52E3E" />
          </div>
        </button>

        {/* Agente card */}
        <button
          onClick={handleAgentSelect}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "white",
            border: "2px solid transparent",
            borderRadius: 24,
            padding: "26px 22px",
            cursor: "pointer",
            textAlign: "left",
            boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
            transition: "all 0.18s ease",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#4417E6";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(68,23,230,0.16)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          {/* Icon */}
          <div style={{ width: 60, height: 60, borderRadius: 20, background: "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(197,46,62,0.12)" }}>
            <Briefcase size={26} color="#C52E3E" strokeWidth={1.8} />
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.5px" }}>
              Agente
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#6e6e73", lineHeight: 1.55 }}>
              Conectás propietarios con compradores o inquilinos y generás ingresos por cada operación.
            </p>
          </div>

          {/* Arrow */}
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "#fff4ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ChevronRight size={16} color="#C52E3E" />
          </div>
        </button>

        {/* Fine print */}
        <p style={{ marginTop: 8, textAlign: "center", color: "#9a9aa0", fontSize: 12, lineHeight: 1.6, maxWidth: 300 }}>
          Al continuar aceptás nuestros{" "}
          <span style={{ color: "#4417E6", fontWeight: 600 }}>Términos de uso</span> y{" "}
          <span style={{ color: "#4417E6", fontWeight: 600 }}>Política de privacidad</span>
        </p>
      </div>
    </div>
  );
}
