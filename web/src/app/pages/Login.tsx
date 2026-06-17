import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { showToast } from "../../lib/toast";
import { navigateAfterAuth } from "../../lib/onboarding/post-registration-navigation";
export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    code2FA: "",
    keepLoggedIn: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.data.user.role === "AGENT") {
        sessionStorage.setItem("userType", "agente");
      } else if (response.data.user.role === "OWNER") {
        sessionStorage.setItem("userType", "propie");
      } else {
        sessionStorage.removeItem("userType");
      }

      auth.login(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.user,
      );

      navigateAfterAuth(response.data.user.role, navigate, { replace: true });
    } catch (error: unknown) {
      console.error(error);
      const message =
        typeof error === "object" &&
        error !== null &&
        "error" in error &&
        typeof (error as { error?: { message?: string } }).error?.message === "string"
          ? (error as { error: { message: string } }).error.message
          : "Error al iniciar sesión";
      showToast(message);
    }
  };



  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = formData.email && validateEmail(formData.email);
  const isPasswordValid = formData.password.length >= 8;
  const is2FAValid = formData.code2FA.length === 6;

  const isFormValid = show2FA
    ? isEmailValid && isPasswordValid && is2FAValid
    : isEmailValid && isPasswordValid;

  return (
    <div className="app-auth-shell">
      {/* ── HERO ── */}
      <div
        className="app-auth-shell__hero"
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

        <AuthHeroHeader onBack={() => navigate("/explore")} logoSize={58} showRegisterProgress={false} />

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
            {show2FA ? "Verificación 2FA" : "Iniciar sesión"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            {show2FA ? "Ingresá el código de autenticación" : "Bienvenido de vuelta a Propie"}
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
        className="app-auth-shell__body"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {!show2FA ? (
            <div style={{ marginBottom: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#6e6e73", lineHeight: 1.55, textAlign: "center" }}>
                Ingresá con tu email y contraseña de Propie.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <p style={{ textAlign: "center", color: "#6e6e73", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Ingresá el código de 6 dígitos de tu aplicación de autenticación
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!show2FA ? (
              <>
                {/* Email */}
                <div>
                  <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                    Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                          (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                          (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Tu contraseña"
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
                          (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                          (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
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

                {/* Keep logged in */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#1a1a1a",
                    marginTop: 4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.keepLoggedIn}
                    onChange={(e) => setFormData({ ...formData, keepLoggedIn: e.target.checked })}
                    style={{
                      width: 18,
                      height: 18,
                      cursor: "pointer",
                      accentColor: "#4417E6",
                    }}
                  />
                  <span>Mantener sesión iniciada</span>
                </label>

                {/* Forgot password */}
                <div style={{ textAlign: "right", marginTop: -8 }}>
                  <button
                    type="button"
                    onClick={() => console.log("Recuperar contraseña")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#4417E6",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 2FA Code */}
                <div>
                  <label htmlFor="code2FA" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                    Código de autenticación
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="code2FA"
                      type="text"
                      inputMode="numeric"
                      value={formData.code2FA}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setFormData({ ...formData, code2FA: value });
                      }}
                      placeholder="000000"
                      style={{
                        width: "100%",
                        padding: "16px 50px 16px 16px",
                        borderRadius: 14,
                        border: is2FAValid ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        textAlign: "center",
                        letterSpacing: "0.3em",
                        outline: "none",
                        transition: "all 0.15s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        if (!is2FAValid) {
                          (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                          (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                        }
                      }}
                      onBlur={(e) => {
                        if (!is2FAValid) {
                          (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                          (e.target as HTMLInputElement).style.boxShadow = "none";
                        }
                      }}
                    />
                    {is2FAValid && (
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
                </div>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setShow2FA(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#4417E6",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "center",
                  }}
                >
                  ← Volver a credenciales
                </button>
              </>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                width: "100%",
                background: isFormValid ? "#4417E6" : "#e5e5ea",
                border: "none",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: isFormValid ? "pointer" : "not-allowed",
                fontSize: 16,
                fontWeight: 700,
                color: isFormValid ? "white" : "#9a9aa0",
                transition: "all 0.18s ease",
                marginTop: 8,
                boxShadow: isFormValid ? "0 4px 16px rgba(68,23,230,0.24)" : "none",
              }}
              onMouseEnter={(e) => {
                if (isFormValid) {
                  (e.currentTarget as HTMLButtonElement).style.background = "#3510B8";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(68,23,230,0.32)";
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid) {
                  (e.currentTarget as HTMLButtonElement).style.background = "#4417E6";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(68,23,230,0.24)";
                }
              }}
            >
              {show2FA ? "Verificar e iniciar sesión" : "Iniciar sesión"}
            </button>
          </form>

          {/* Fine print */}
          {!show2FA && (
            <p style={{ marginTop: 24, textAlign: "center", color: "#9a9aa0", fontSize: 12, lineHeight: 1.6 }}>
              ¿No tenés cuenta?{" "}
              <span
                onClick={() => navigate("/registro")}
                style={{ color: "#4417E6", fontWeight: 600, cursor: "pointer" }}
              >
                Registrate
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
