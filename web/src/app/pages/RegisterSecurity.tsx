import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, Check, Shield, Fingerprint, Lock, Mail, Smartphone } from "lucide-react";
import React from "react";

export default function RegisterSecurity() {
  const navigate = useNavigate();
  const [enable2FA, setEnable2FA] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [enablePIN, setEnablePIN] = useState(false);
  const [pin, setPin] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");

  const userType = sessionStorage.getItem("userType");
  const isAgent = userType === "agente";

  const colors = {
    gradient: isAgent
      ? "linear-gradient(160deg, #FF8C5B 0%, #C52E3E 55%, #A82534 100%)"
      : "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
    primary: isAgent ? "#C52E3E" : "#4417E6",
    primaryDark: isAgent ? "#A82534" : "#3510B8",
    focusShadow: isAgent ? "0 0 0 3px rgba(197,46,62,0.08)" : "0 0 0 3px rgba(68,23,230,0.08)",
    buttonShadow: isAgent ? "0 4px 16px rgba(197,46,62,0.24)" : "0 4px 16px rgba(68,23,230,0.24)",
    buttonHoverShadow: isAgent ? "0 6px 20px rgba(197,46,62,0.32)" : "0 6px 20px rgba(68,23,230,0.32)",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar configuración de seguridad
    console.log("Seguridad:", {
      enable2FA,
      enableBiometric,
      enablePIN,
      pin,
      recoveryEmail,
      recoveryPhone,
    });
    navigate("/registro/foto-perfil");
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isRecoveryEmailValid = recoveryEmail && validateEmail(recoveryEmail);
  const isRecoveryPhoneValid = recoveryPhone.length >= 10;
  const isPinValid = pin.length === 4;

  const isFormValid =
    (enablePIN ? isPinValid : true) &&
    isRecoveryEmailValid &&
    isRecoveryPhoneValid;

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
            Seguridad de cuenta
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Protegé tu cuenta con medidas de seguridad adicionales
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
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Section: Activar seguridad */}
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
                Activar seguridad
              </h3>

              {/* 2FA Toggle */}
              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "18px",
                  marginBottom: 12,
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                  border: "1.5px solid #e5e5ea",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={20} color={colors.primary} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
                      Autenticación 2FA
                    </h4>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6e6e73", lineHeight: 1.4 }}>
                      Código adicional al iniciar sesión
                    </p>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: 48, height: 28, flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={enable2FA}
                      onChange={(e) => setEnable2FA(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: enable2FA ? colors.primary : "#e5e5ea",
                        transition: "0.3s",
                        borderRadius: 28,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: "",
                          height: 22,
                          width: 22,
                          left: enable2FA ? 23 : 3,
                          bottom: 3,
                          background: "white",
                          transition: "0.3s",
                          borderRadius: "50%",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>

              {/* Biometric Toggle */}
              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "18px",
                  marginBottom: 12,
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                  border: "1.5px solid #e5e5ea",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Fingerprint size={20} color={colors.primary} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
                      Biometría
                    </h4>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6e6e73", lineHeight: 1.4 }}>
                      Huella digital o reconocimiento facial
                    </p>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: 48, height: 28, flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={enableBiometric}
                      onChange={(e) => setEnableBiometric(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: enableBiometric ? colors.primary : "#e5e5ea",
                        transition: "0.3s",
                        borderRadius: 28,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: "",
                          height: 22,
                          width: 22,
                          left: enableBiometric ? 23 : 3,
                          bottom: 3,
                          background: "white",
                          transition: "0.3s",
                          borderRadius: "50%",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>

              {/* PIN Toggle */}
              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "18px",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                  border: "1.5px solid #e5e5ea",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Lock size={20} color={colors.primary} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
                      PIN de seguridad
                    </h4>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6e6e73", lineHeight: 1.4 }}>
                      Código de 4 dígitos
                    </p>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: 48, height: 28, flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={enablePIN}
                      onChange={(e) => setEnablePIN(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: enablePIN ? colors.primary : "#e5e5ea",
                        transition: "0.3s",
                        borderRadius: 28,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: "",
                          height: 22,
                          width: 22,
                          left: enablePIN ? 23 : 3,
                          bottom: 3,
                          background: "white",
                          transition: "0.3s",
                          borderRadius: "50%",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      />
                    </span>
                  </label>
                </div>

                {enablePIN && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="password"
                        inputMode="numeric"
                        value={pin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setPin(value);
                        }}
                        placeholder="Ingresá tu PIN de 4 dígitos"
                        style={{
                          width: "100%",
                          padding: "14px 48px 14px 16px",
                          borderRadius: 14,
                          border: isPinValid ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                          fontSize: 15,
                          color: "#1a1a1a",
                          outline: "none",
                          transition: "all 0.15s ease",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => {
                          if (!isPinValid) {
                            (e.target as HTMLInputElement).style.borderColor = colors.primary;
                            (e.target as HTMLInputElement).style.boxShadow = colors.focusShadow;
                          }
                        }}
                        onBlur={(e) => {
                          if (!isPinValid) {
                            (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                            (e.target as HTMLInputElement).style.boxShadow = "none";
                          }
                        }}
                      />
                      {isPinValid && (
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
                )}
              </div>
            </div>

            {/* Section: Recovery */}
            <div style={{ marginTop: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
                Opciones de recuperación
              </h3>

              {/* Recovery Email */}
              <div style={{ marginBottom: 12 }}>
                <label htmlFor="recoveryEmail" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                  Email de recuperación
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
                    }}
                  >
                    <Mail size={18} color="#9a9aa0" />
                  </div>
                  <input
                    id="recoveryEmail"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="recuperacion@email.com"
                    style={{
                      width: "100%",
                      padding: "14px 48px 14px 46px",
                      borderRadius: 14,
                      border: isRecoveryEmailValid ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                      fontSize: 15,
                      color: "#1a1a1a",
                      outline: "none",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      if (!isRecoveryEmailValid) {
                        (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                        (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                      }
                    }}
                    onBlur={(e) => {
                      if (!isRecoveryEmailValid) {
                        (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                        (e.target as HTMLInputElement).style.boxShadow = "none";
                      }
                    }}
                  />
                  {isRecoveryEmailValid && (
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

              {/* Recovery Phone */}
              <div>
                <label htmlFor="recoveryPhone" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                  Teléfono de recuperación
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 15,
                      color: "#1a1a1a",
                      background: "#f5f5f7",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      minWidth: 60,
                    }}
                  >
                    +54
                  </div>
                  <div style={{ position: "relative", flex: 1 }}>
                    <div
                      style={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Smartphone size={18} color="#9a9aa0" />
                    </div>
                    <input
                      id="recoveryPhone"
                      type="tel"
                      value={recoveryPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setRecoveryPhone(value);
                      }}
                      placeholder="11 2345 6789"
                      style={{
                        width: "100%",
                        padding: "14px 48px 14px 46px",
                        borderRadius: 14,
                        border: isRecoveryPhoneValid ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                        fontSize: 15,
                        color: "#1a1a1a",
                        outline: "none",
                        transition: "all 0.15s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        if (!isRecoveryPhoneValid) {
                          (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                          (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                        }
                      }}
                      onBlur={(e) => {
                        if (!isRecoveryPhoneValid) {
                          (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                          (e.target as HTMLInputElement).style.boxShadow = "none";
                        }
                      }}
                    />
                    {isRecoveryPhoneValid && (
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
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                width: "100%",
                background: isFormValid ? colors.primary : "#e5e5ea",
                border: "none",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: isFormValid ? "pointer" : "not-allowed",
                fontSize: 16,
                fontWeight: 700,
                color: isFormValid ? "white" : "#9a9aa0",
                transition: "all 0.18s ease",
                marginTop: 16,
                boxShadow: isFormValid ? colors.buttonShadow : "none",
              }}
              onMouseEnter={(e) => {
                if (isFormValid) {
                  (e.currentTarget as HTMLButtonElement).style.background = colors.primaryDark;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = colors.buttonHoverShadow;
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid) {
                  (e.currentTarget as HTMLButtonElement).style.background = colors.primary;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = colors.buttonShadow;
                }
              }}
            >
              Continuar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
