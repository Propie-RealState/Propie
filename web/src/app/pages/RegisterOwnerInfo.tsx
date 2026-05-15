import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, Check } from "lucide-react";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { RegisterSuccessOverlay } from "../components/register/RegisterSuccessOverlay";
import { REGISTER_COMPLETION } from "../components/register/registerCompletionTheme";
import { apiFetch } from "../../lib/api";
import { buildRegisterPayload } from "../../lib/buildRegisterPayload";
import { useAuth } from "../../context/AuthContext";

export default function RegisterOwnerInfo() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data, updateData } = useRegister();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ownerTheme = REGISTER_COMPLETION.OWNER;

  const handleFinalizar = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      updateData({
        mainGoal: "EXPLORE",
      });

      const payload = buildRegisterPayload(
        {
          ...data,
          mainGoal: "EXPLORE",
        },
        "OWNER",
        "EXPLORE"
      );

      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const authData = response?.data;

      if (
        !authData?.accessToken ||
        !authData?.refreshToken ||
        !authData?.user
      ) {
        throw new Error("INVALID_REGISTER_RESPONSE");
      }

      auth.login(
        authData.accessToken,
        authData.refreshToken,
        authData.user
      );

      sessionStorage.setItem("userType", "propie");

      setShowSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessFinish = useCallback(() => {
    setShowSuccess(false);
    navigate("/explorar", { replace: true });
  }, [navigate]);

  const charCount = data.bio.length;
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
      <RegisterSuccessOverlay
        open={showSuccess}
        variant="OWNER"
        title="¡Tu cuenta está lista!"
        subtitle="Ya creamos tu perfil de propietario. Bienvenido a Propie."
        onFinish={handleSuccessFinish}
      />

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
        <div style={{ position: "absolute", width: 300, height: 300, background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)", top: -80, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 180, height: 180, background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", bottom: 40, left: -40, pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 420, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <button
            type="button"
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

          <div style={{ width: 80 }} />
        </div>

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
          <div>
            <label htmlFor="bio" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
              Sobre mí <span style={{ color: "#9a9aa0", fontWeight: 400 }}>(opcional)</span>
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                id="bio"
                value={data.bio}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    updateData({
                      bio: e.target.value,
                    });
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

          <button
            type="button"
            onClick={handleFinalizar}
            disabled={isSubmitting}
            style={{
              width: "100%",
              background: isSubmitting ? "#e5e5ea" : ownerTheme.primary,
              border: "none",
              borderRadius: 16,
              padding: "16px 20px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.18s ease",
              boxShadow: isSubmitting ? "none" : ownerTheme.buttonShadow,
            }}
            onMouseEnter={(e) => {
              if (isSubmitting) return;
              (e.currentTarget as HTMLButtonElement).style.background = ownerTheme.primaryHover;
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = ownerTheme.buttonShadowHover;
            }}
            onMouseLeave={(e) => {
              if (isSubmitting) return;
              (e.currentTarget as HTMLButtonElement).style.background = ownerTheme.primary;
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = ownerTheme.buttonShadow;
            }}
          >
            <Check size={22} color="white" strokeWidth={2.5} />
            <span style={{ fontSize: 17, fontWeight: 800, color: "white", letterSpacing: "-0.2px" }}>
              {isSubmitting ? "Creando cuenta…" : "Finalizar"}
            </span>
          </button>

          <div
            style={{
              background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
              borderRadius: 16,
              padding: "16px 18px",
              marginTop: 4,
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
