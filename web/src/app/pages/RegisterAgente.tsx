import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Check } from "lucide-react";
import React from "react";

export default function RegisterAgente() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("userType", "agente");
    console.log("Registro agente:", { email, password });
    navigate("/registro/verificacion");
  };

  const handleSocialLogin = (provider: string) => {
    sessionStorage.setItem("userType", "agente");
    console.log("Login social:", provider);
    navigate("/registro/verificacion");
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const isFormValid = isEmailValid && isPasswordValid;

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
          background: "linear-gradient(160deg, #FF8C5B 0%, #C52E3E 55%, #A82534 100%)",
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
            Creá tu cuenta de Propie
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
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
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Social buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              style={{
                width: "100%",
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d1d6";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              Continuar con Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("apple")}
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: "1.5px solid #1a1a1a",
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#2a2a2a";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#1a1a1a";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
                <path d="M14.315 15.098c-.747 1.01-1.563 2.025-2.82 2.046-1.238.02-1.637-.735-3.055-.735-1.417 0-1.86.714-3.034.756-1.217.042-2.155-1.114-2.907-2.12-1.536-2.056-2.708-5.81-1.133-8.345.78-1.26 2.177-2.058 3.691-2.079 1.153-.02 2.242.776 2.947.776.705 0 2.027-.96 3.415-.818.582.024 2.215.235 3.265 1.77-.084.053-1.95 1.14-1.93 3.402.022 2.697 2.368 3.597 2.39 3.608-.019.06-.373 1.278-1.23 2.532l-.599.207zm-3.17-11.87c.628-.76 1.05-1.817.934-2.87-.903.036-1.998.602-2.646 1.36-.58.673-1.089 1.748-.953 2.78 1.007.078 2.037-.513 2.665-1.27z" />
              </svg>
              Continuar con Apple
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "8px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
            <span style={{ fontSize: 13, color: "#9a9aa0", fontWeight: 500 }}>o con email</span>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                <Mail size={18} color="#9a9aa0" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{
                  width: "100%",
                  padding: "14px 46px 14px 46px",
                  borderRadius: 14,
                  border: isEmailValid && email ? "1.5px solid #10b981" : "1.5px solid #e5e5ea",
                  fontSize: 15,
                  color: "#1a1a1a",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  if (!isEmailValid || !email) {
                    (e.target as HTMLInputElement).style.borderColor = "#C52E3E";
                    (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(197,46,62,0.08)";
                  }
                }}
                onBlur={(e) => {
                  if (!isEmailValid || !email) {
                    (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }
                }}
              />
              {isEmailValid && email && (
                <div
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <Check size={18} color="#10b981" strokeWidth={3} />
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
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                <Lock size={18} color="#9a9aa0" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                style={{
                  width: "100%",
                  padding: "14px 46px 14px 46px",
                  borderRadius: 14,
                  border: isPasswordValid && password ? "1.5px solid #10b981" : "1.5px solid #e5e5ea",
                  fontSize: 15,
                  color: "#1a1a1a",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  if (!isPasswordValid || !password) {
                    (e.target as HTMLInputElement).style.borderColor = "#C52E3E";
                    (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(197,46,62,0.08)";
                  }
                }}
                onBlur={(e) => {
                  if (!isPasswordValid || !password) {
                    (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} color="#9a9aa0" /> : <Eye size={18} color="#9a9aa0" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isFormValid}
            style={{
              width: "100%",
              background: isFormValid ? "#C52E3E" : "#e5e5ea",
              border: "none",
              borderRadius: 14,
              padding: "15px 18px",
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
                (e.currentTarget as HTMLButtonElement).style.background = "#A82534";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(197,46,62,0.32)";
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid) {
                (e.currentTarget as HTMLButtonElement).style.background = "#C52E3E";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(197,46,62,0.24)";
              }
            }}
          >
            Continuar
          </button>

          {/* Login link */}
          <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 14, color: "#6e6e73" }}>
            ¿Ya tenés cuenta?{" "}
            <button
              type="button"
              onClick={() => navigate("/ingresar")}
              style={{
                background: "none",
                border: "none",
                color: "#C52E3E",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                fontSize: 14,
              }}
            >
              Ingresá
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
