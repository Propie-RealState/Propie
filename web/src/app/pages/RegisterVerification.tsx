import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, Mail, Check } from "lucide-react";
import React from "react";

export default function RegisterVerification() {
  const navigate = useNavigate();
  const [emailCode, setEmailCode] = useState("");
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailVerified, setEmailVerified] = useState(false);

  const userType = sessionStorage.getItem("userType");
  const isAgent = userType === "agente";

  const colors = {
    gradient: isAgent
      ? "linear-gradient(160deg, #FF8C5B 0%, #C52E3E 55%, #A82534 100%)"
      : "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
    primary: isAgent ? "#C52E3E" : "#4417E6",
    lightBg: isAgent
      ? "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)"
      : "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
  };

  // Email Timer
  useEffect(() => {
    if (emailTimer > 0 && !emailVerified) {
      const interval = setInterval(() => {
        setEmailTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [emailTimer, emailVerified]);

  // Auto-verify when code is complete (mock verification)
  useEffect(() => {
    if (emailCode.length === 6 && emailCode === "123456") {
      setTimeout(() => {
        setEmailVerified(true);
        // Navigate to next page after verification
        setTimeout(() => {
          navigate("/registro/datos-personales");
        }, 800);
      }, 500);
    }
  }, [emailCode, navigate]);

  const handleResendEmail = () => {
    setEmailTimer(60);
    setEmailCode("");
    // TODO: Implementar reenvío de Email
    console.log("Reenviar Email");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      {/* ── HERO ── */}
      <div
        style={{
          position: "relative",
          background: colors.gradient,
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
            Verificá tu email
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Enviamos un código de verificación a tu correo electrónico
          </p>
        </div>

        {/* Wave */}
        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}>
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
        </div>
      </div>

      {/* ── VERIFICATION FORM ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Email Verification Card */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "2px solid transparent",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: colors.lightBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                <Mail size={22} color={colors.primary} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
                  Código Email
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6e6e73" }}>
                  Enviado a tu••••@email.com
                </p>
              </div>
              {emailVerified && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#34C759",
                  }}
                >
                  <Check size={16} strokeWidth={2.5} />
                  Verificado
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={emailCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setEmailCode(value);
                }}
                placeholder="000000"
                disabled={emailVerified}
                style={{
                  width: "100%",
                  padding: "16px 50px 16px 16px",
                  borderRadius: 14,
                  border: "1.5px solid #e5e5ea",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  textAlign: "center",
                  letterSpacing: "0.3em",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                  background: "white",
                }}
                onFocus={(e) => {
                  if (!emailVerified) {
                    (e.target as HTMLInputElement).style.borderColor = colors.primary;
                    (e.target as HTMLInputElement).style.boxShadow = isAgent
                      ? "0 0 0 3px rgba(197,46,62,0.08)"
                      : "0 0 0 3px rgba(68,23,230,0.08)";
                  }
                }}
                onBlur={(e) => {
                  if (!emailVerified) {
                    (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }
                }}
              />
              {emailVerified && (
                <div
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={20} color="#34C759" strokeWidth={2.5} />
                </div>
              )}
            </div>

            {!emailVerified && (
              <div style={{ marginTop: 12, textAlign: "center", fontSize: 13 }}>
                {emailTimer > 0 ? (
                  <span style={{ color: "#9a9aa0" }}>
                    Reenviar código en{" "}
                    <span style={{ fontWeight: 600, color: colors.primary }}>{formatTime(emailTimer)}</span>
                  </span>
                ) : (
                  <button
                    onClick={handleResendEmail}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: colors.primary,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 13,
                      padding: 0,
                    }}
                  >
                    Reenviar código
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Helper text */}
          <p style={{ marginTop: 16, textAlign: "center", color: "#9a9aa0", fontSize: 12, lineHeight: 1.6 }}>
            Para probar, usá el código <span style={{ fontWeight: 600, color: colors.primary }}>123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
