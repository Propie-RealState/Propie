import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, Eye, EyeOff, Check, Mail, Lock } from "lucide-react";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { AGENT_THEME } from "../../theme/app-theme";
import { syncUserTypeFromRole } from "../../theme/app-theme";

const theme = AGENT_THEME;

export default function RegisterAgente() {
  const { data, updateData } = useRegister();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (data.role !== "AGENT") {
      updateData({ role: "AGENT" });
    }
    syncUserTypeFromRole("AGENT");
  }, [data.role, updateData]);


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = data.email && validateEmail(data.email);
  const isPasswordValid = data.password.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const isFormValid =
    data.firstName &&
    data.lastName &&
    isEmailValid &&
    isPasswordValid &&
    data.acceptTerms &&
    data.acceptPrivacy;

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
            Creá tu cuenta de agente
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 280 }}>
            Empezá a conectar propietarios con compradores
          </p>
        </div>

        {/* Wave */}
        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}>
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
        </div>
      </div>

      {/* ── FORM ── */}
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
          {/* Social buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => handleSocialLogin("Google")}
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
                transition: "all 0.15s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = theme.primary;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(197,46,62,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path
                  d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
                  fill="#4285F4"
                />
                <path
                  d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
                  fill="#34A853"
                />
                <path
                  d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
                  fill="#FBBC05"
                />
                <path
                  d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </button>

            <button
              onClick={() => handleSocialLogin("Apple")}
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
                transition: "all 0.15s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#1a1a1a";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#000000";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.05 14.32c-.39.88-.58 1.27-1.08 2.05-.7 1.09-1.69 2.45-2.91 2.46-1.09.01-1.37-.71-2.84-.7-1.48.01-1.8.72-2.89.7-1.23-.01-2.13-1.21-2.83-2.3-1.95-3.03-2.16-6.58-.95-8.47.85-1.33 2.18-2.11 3.43-2.11 1.28 0 2.08.71 3.13.71 1.01 0 1.62-.71 3.08-.71 1.1 0 2.27.6 3.1 1.64-2.73 1.5-2.29 5.4.76 6.73zM13.05 3.43c.53-.69.93-1.65.78-2.63-.85.04-1.85.6-2.44 1.32-.52.63-.96 1.6-.79 2.54.93.02 1.89-.53 2.45-1.23z" />
              </svg>
              Continuar con Apple
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
            <span style={{ fontSize: 13, color: "#9a9aa0", fontWeight: 500 }}>o</span>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name row */}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstName" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                  Nombre
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="firstName"
                    type="text"
                    value={data.firstName}
                    onChange={(e) => updateData({ ...data, firstName: e.target.value })}
                    placeholder="Tu nombre"
                    style={{
                      width: "100%",
                      padding: "14px 48px 14px 16px",
                      borderRadius: 14,
                      border: data.firstName ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                      fontSize: 15,
                      color: "#1a1a1a",
                      outline: "none",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      if (!data.firstName) {
                        (e.target as HTMLInputElement).style.borderColor = theme.primary;
                        (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(197,46,62,0.08)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!data.firstName) {
                        (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                        (e.target as HTMLInputElement).style.boxShadow = "none";
                      }
                    }}
                  />
                  {data.firstName && (
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
                      <Check size={18} color="#34C759" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="lastName" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                  Apellido
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="lastName"
                    type="text"
                    value={data.lastName}
                    onChange={(e) => updateData({ ...data, lastName: e.target.value })}
                    placeholder="Tu apellido"
                    style={{
                      width: "100%",
                      padding: "14px 48px 14px 16px",
                      borderRadius: 14,
                      border: data.lastName ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                      fontSize: 15,
                      color: "#1a1a1a",
                      outline: "none",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      if (!data.lastName) {
                        (e.target as HTMLInputElement).style.borderColor = theme.primary;
                        (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(197,46,62,0.08)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!data.lastName) {
                        (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                        (e.target as HTMLInputElement).style.boxShadow = "none";
                      }
                    }}
                  />
                  {data.lastName && (
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
                      <Check size={18} color="#34C759" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData({ ...data, email: e.target.value })}
                  placeholder="tu@email.com"
                  style={{
                    width: "100%",
                    padding: "14px 48px 14px 16px",
                    borderRadius: 14,
                    border: isEmailValid ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                    fontSize: 15,
                    color: "#1a1a1a",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    if (!isEmailValid) {
                      (e.target as HTMLInputElement).style.borderColor = theme.primary;
                      (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(197,46,62,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!isEmailValid) {
                      (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
                {isEmailValid && (
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
                    <Check size={18} color="#34C759" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => updateData({ ...data, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  style={{
                    width: "100%",
                    padding: "14px 80px 14px 16px",
                    borderRadius: 14,
                    border: isPasswordValid ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                    fontSize: 15,
                    color: "#1a1a1a",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    if (!isPasswordValid) {
                      (e.target as HTMLInputElement).style.borderColor = theme.primary;
                      (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(197,46,62,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!isPasswordValid) {
                      (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 6, alignItems: "center" }}>
                  {isPasswordValid && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={18} color="#34C759" strokeWidth={2.5} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9a9aa0",
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#1a1a1a",
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={data.acceptTerms}
                  onChange={(e) => updateData({ ...data, acceptTerms: e.target.checked })}
                  style={{
                    width: 18,
                    height: 18, 
                    marginTop: 2,
                    cursor: "pointer",
                    accentColor: theme.primary,
                    flexShrink: 0,
                  }}
                />
                <span>
                  Acepto los{" "}
                  <span style={{ color: theme.primary, fontWeight: 600 }}>términos y condiciones</span>
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#1a1a1a",
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={data.acceptPrivacy}
                  onChange={(e) => updateData({ ...data, acceptPrivacy: e.target.checked })}
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: 2,
                    cursor: "pointer",
                    accentColor: theme.primary,
                    flexShrink: 0,
                  }}
                />
                <span>
                  Acepto la{" "}
                  <span style={{ color: theme.primary, fontWeight: 600 }}>política de privacidad</span>
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                width: "100%",
                background: isFormValid ? theme.primary : "#e5e5ea",
                border: "none",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: isFormValid ? "pointer" : "not-allowed",
                fontSize: 16,
                fontWeight: 700,
                color: isFormValid ? "white" : "#9a9aa0",
                transition: "all 0.18s ease",
                marginTop: 8,
                boxShadow: isFormValid ? "0 4px 16px rgba(197,46,62,0.24)" : "none",
              }}
              onMouseEnter={(e) => {
                if (isFormValid) {
                  (e.currentTarget as HTMLButtonElement).style.background = "theme.primaryDark";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(197,46,62,0.32)";
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid) {
                  (e.currentTarget as HTMLButtonElement).style.background = theme.primary;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(197,46,62,0.24)";
                }
              }}
            >
              Continuar
            </button>
          </form>

          {/* Fine print */}
          <p style={{ marginTop: 24, textAlign: "center", color: "#9a9aa0", fontSize: 12, lineHeight: 1.6 }}>
            ¿Ya tenés cuenta?{" "}
            <span
              onClick={() => navigate("/ingresar")}
              style={{ color: theme.primary, fontWeight: 600, cursor: "pointer" }}
            >
              Iniciá sesión
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
