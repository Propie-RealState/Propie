import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { Mail, Check } from "lucide-react";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { getAppTheme } from "../../theme/app-theme";
import {
  FieldError,
  MOCK_VERIFICATION_CODE,
  fieldAriaProps,
  getFieldBorder,
  useFormValidation,
  validateVerificationCode,
  validateVerificationStep,
} from "../../features/register/validation";

export default function RegisterVerification() {
  const navigate = useNavigate();
  const { data, updateData } = useRegister();
  const [emailCode, setEmailCode] = useState(data.verificationCode || "");
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailVerified, setEmailVerified] = useState(false);
  const [invalidAttempt, setInvalidAttempt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const advanceStartedRef = useRef(false);

  const theme = getAppTheme(data.role === "AGENT");

  const getValues = useCallback(() => ({ verificationCode: emailCode }), [emailCode]);
  const validateAll = useCallback(() => validateVerificationStep(emailCode), [emailCode]);
  const validation = useFormValidation(getValues, validateAll);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (emailTimer > 0 && !emailVerified) {
      const interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [emailTimer, emailVerified]);

  useEffect(() => {
    if (emailCode.length !== 6) {
      setInvalidAttempt(false);
      return;
    }

    const result = validateVerificationCode(emailCode);
    if (!result.valid) {
      if (emailCode !== MOCK_VERIFICATION_CODE) {
        setInvalidAttempt(true);
        validation.handleBlur("verificationCode");
      }
      return;
    }

    if (advanceStartedRef.current) return;
    advanceStartedRef.current = true;

    setInvalidAttempt(false);
    updateData({ verificationCode: emailCode, verifiedAt: new Date().toISOString() });

    const showVerifiedTimer = window.setTimeout(() => {
      setEmailVerified(true);
    }, 500);
    const navigateTimer = window.setTimeout(() => {
      navigate("/registro/personal-data");
    }, 1300);

    return () => {
      clearTimeout(showVerifiedTimer);
      clearTimeout(navigateTimer);
    };
  }, [emailCode, navigate, updateData]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setEmailCode(pasted);
    validation.handleChange("verificationCode", pasted);
  };

  const handleResendEmail = () => {
    setEmailTimer(60);
    setEmailCode("");
    setInvalidAttempt(false);
    inputRef.current?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const hasError = validation.showError("verificationCode") || invalidAttempt;
  const errorMessage = invalidAttempt
    ? "Código incorrecto. Probá con 123456"
    : validation.getError("verificationCode");

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#f5f5f7", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: "relative", background: theme.heroGradient, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 0 }}>
        <AuthHeroHeader />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 28px 12px" }}>
          <h1 style={{ color: "white", fontSize: "clamp(26px, 7vw, 34px)", fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.15, fontFamily: "'Sora', sans-serif", margin: 0 }}>
            Verificá tu email
          </h1>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 40px" }}>
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: theme.lightBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={22} color={theme.primary} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>Código Email</h3>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6e6e73" }}>Enviado a tu••••@email.com</p>
              </div>
              {emailVerified && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#34C759" }}>
                  <Check size={16} strokeWidth={2.5} />
                  Verificado
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={emailCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setEmailCode(value);
                  validation.handleChange("verificationCode", value);
                }}
                onBlur={() => validation.handleBlur("verificationCode")}
                onPaste={handlePaste}
                placeholder="000000"
                disabled={emailVerified}
                maxLength={6}
                style={{
                  width: "100%",
                  padding: "16px 50px 16px 16px",
                  borderRadius: 14,
                  border: getFieldBorder(hasError ? "error" : emailVerified ? "success" : "default"),
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  textAlign: "center",
                  letterSpacing: "0.3em",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "white",
                }}
                {...fieldAriaProps("verificationCode", hasError, "verificationCode-error")}
              />
              {emailVerified && (
                <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
                  <Check size={20} color="#34C759" strokeWidth={2.5} />
                </div>
              )}
            </div>
            <FieldError id="verificationCode-error" message={errorMessage} />

            {!emailVerified && (
              <div style={{ marginTop: 12, textAlign: "center", fontSize: 13 }}>
                {emailTimer > 0 ? (
                  <span style={{ color: "#9a9aa0" }}>
                    Reenviar código en <span style={{ fontWeight: 600, color: theme.primary }}>{formatTime(emailTimer)}</span>
                  </span>
                ) : (
                  <button onClick={handleResendEmail} type="button" style={{ background: "transparent", border: "none", color: theme.primary, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                    Reenviar código
                  </button>
                )}
              </div>
            )}
          </div>

          <p style={{ marginTop: 16, textAlign: "center", color: "#9a9aa0", fontSize: 12, lineHeight: 1.6 }}>
            Para probar, usá el código <span style={{ fontWeight: 600, color: theme.primary }}>123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
