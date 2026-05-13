import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, Home, Search } from "lucide-react";
import React from "react";

export default function RegisterOwnerInfo() {
  const navigate = useNavigate();
  const [bio, setBio] = useState("");

  const handlePublish = () => {
    // TODO: Implementar navegación a publicar
    console.log("Ir a publicar", { bio });
    navigate("/publicar");
  };

  const handleExplore = () => {
    // TODO: Implementar navegación a explorar
    console.log("Ir a explorar", { bio });
    navigate("/explorar");
  };

  const charCount = bio.length;
  const maxChars = 300;

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

        {/* Nav row */}
        <div style={{ width: "100%", maxWidth: 420, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "white",
              padding: "8px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            <ArrowLeft size={15} color="white" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Volver</span>
          </button>

          <PropieLogo size={38} />

          {/* spacer */}
          <div style={{ width: 80 }} />
        </div>

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
            ¡Ya casi terminamos!
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Contanos un poco sobre vos como propietario
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
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Bio section */}
          <div>
            <label htmlFor="bio" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
              Sobre mí <span style={{ color: "#9a9aa0", fontWeight: 400 }}>(opcional)</span>
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setBio(e.target.value);
                  }
                }}
                placeholder="Contale a otros usuarios sobre tu experiencia como propietario, tus expectativas, o lo que consideres importante..."
                rows={6}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1.5px solid #e5e5ea",
                  fontSize: 15,
                  color: "#1a1a1a",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                  resize: "none",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.6,
                }}
                onFocus={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor = "#4417E6";
                  (e.target as HTMLTextAreaElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor = "#e5e5ea";
                  (e.target as HTMLTextAreaElement).style.boxShadow = "none";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 16,
                  fontSize: 12,
                  color: charCount > maxChars * 0.9 ? "#C52E3E" : "#9a9aa0",
                  fontWeight: 500,
                }}
              >
                {charCount}/{maxChars}
              </div>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9a9aa0", lineHeight: 1.5 }}>
              Esta información ayuda a generar confianza con potenciales inquilinos o compradores
            </p>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
            <span style={{ fontSize: 13, color: "#9a9aa0", fontWeight: 500 }}>¿Qué querés hacer?</span>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Publish button */}
            <button
              onClick={handlePublish}
              style={{
                width: "100%",
                background: "#4417E6",
                border: "none",
                borderRadius: 16,
                padding: "18px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.18s ease",
                boxShadow: "0 4px 16px rgba(68,23,230,0.24)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#3510B8";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(68,23,230,0.32)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#4417E6";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(68,23,230,0.24)";
              }}
            >
              <Home size={20} color="white" strokeWidth={2} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
                  Publicar mi propiedad
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                  Empezá a recibir consultas de inmediato
                </div>
              </div>
            </button>

            {/* Explore button */}
            <button
              onClick={handleExplore}
              style={{
                width: "100%",
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "18px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.18s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#4417E6";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(68,23,230,0.1)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <Search size={20} color="#4417E6" strokeWidth={2} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
                  Explorar propiedades
                </div>
                <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                  Mirá qué hay disponible en el mercado
                </div>
              </div>
            </button>
          </div>

          {/* Info box */}
          <div
            style={{
              background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
              borderRadius: 16,
              padding: "16px 18px",
              marginTop: 8,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#4417E6", lineHeight: 1.6, fontWeight: 500 }}>
              💡 Podés completar tu perfil en cualquier momento desde la configuración de tu cuenta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
