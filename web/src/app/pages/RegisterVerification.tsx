import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { Mail, Check } from "lucide-react";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { useAuth } from "../../context/AuthContext";
import { getAppTheme } from "../../theme/app-theme";
import { apiFetch } from "../../lib/api";
import { RegisterSuccessOverlay } from "../components/register/RegisterSuccessOverlay";
import { REGISTER_COMPLETION } from "../components/register/registerCompletionTheme";
import { completeSignupSession } from "../../features/register/complete-signup-session";
import {
  FieldError,
  fieldAriaProps,
  getFieldBorder,
  useFormValidation,
  validateVerificationStep,
} from "../../features/register/validation";
import {
  canManualSubmitVerification,
  clearVerificationBlock,
  isRateLimitError,
  mapVerificationError,
  readVerificationBlock,
  shouldTriggerAutoSubmit,
  writeVerificationBlock,
} from "../../features/register/verification/email-verification";

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return "tu email";
  }

  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}${"•".repeat(Math.max(localPart.length - visible.length, 2))}@${domain}`;
}

export default function RegisterVerification() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data, updateData, reset } = useRegister();
  const [emailCode, setEmailCode] = useState(data.verificationCode || "");
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailVerified, setEmailVerified] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSubmittedCodeRef = useRef<string | null>(null);
  const isVerifyingRef = useRef(false);
  const rateLimitedRef = useRef(false);
  const emailVerifiedRef = useRef(false);
  const handleBlurRef = useRef<(field: string) => void>(() => {});

  const theme = getAppTheme(data.role === "AGENT");
  const successVariant =
    data.role === "AGENT"
      ? "AGENT"
      : data.role === "CLIENT"
        ? "CLIENT"
        : "OWNER";

  const getValues = useCallback(() => ({ verificationCode: emailCode }), [emailCode]);
  const validateAll = useCallback(() => validateVerificationStep(emailCode), [emailCode]);
  const validation = useFormValidation(getValues, validateAll);
  handleBlurRef.current = validation.handleBlur;

  emailVerifiedRef.current = emailVerified;

  useEffect(() => {
    const blockedCode = readVerificationBlock(data.email);
    if (!blockedCode) {
      return;
    }

    rateLimitedRef.current = true;
    setRateLimited(true);
    lastSubmittedCodeRef.current = blockedCode;
    setSubmitError(mapVerificationError({ statusCode: 429 }));
  }, [data.email]);

  const resetSubmissionState = useCallback(() => {
    lastSubmittedCodeRef.current = null;
    rateLimitedRef.current = false;
    setRateLimited(false);
    clearVerificationBlock(data.email);
  }, [data.email]);

  const completeRegistration = useCallback(async () => {
    await completeSignupSession(auth, data);
    setShowSuccess(true);
  }, [auth, data]);

  const submitVerification = useCallback(
    async (code: string, source: "auto" | "manual") => {
      if (isVerifyingRef.current || emailVerifiedRef.current) {
        return;
      }

      if (source === "auto" && rateLimitedRef.current) {
        return;
      }

      if (source === "auto" && lastSubmittedCodeRef.current === code) {
        return;
      }

      if (
        source === "manual" &&
        !canManualSubmitVerification({
          code,
          emailVerified: emailVerifiedRef.current,
          isSubmitting: isVerifyingRef.current,
        })
      ) {
        return;
      }

      isVerifyingRef.current = true;
      lastSubmittedCodeRef.current = code;
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await apiFetch("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({
            email: data.email,
            code,
          }),
        });

        clearVerificationBlock(data.email);

        clearVerificationBlock(data.email);

        updateData({
          verificationCode: code,
          verifiedAt: new Date().toISOString(),
        });

        setEmailVerified(true);
        emailVerifiedRef.current = true;
        await completeRegistration();
      } catch (error) {
        if (isRateLimitError(error)) {
          rateLimitedRef.current = true;
          setRateLimited(true);
          writeVerificationBlock(data.email, code);
        }

        setSubmitError(mapVerificationError(error));
        handleBlurRef.current("verificationCode");
      } finally {
        isVerifyingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [completeRegistration, data.email, updateData],
  );

  useEffect(() => {
    if (!data.email && !showSuccess && !emailVerified) {
      navigate("/registro");
    }
  }, [data.email, emailVerified, navigate, showSuccess]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (emailTimer > 0 && !emailVerified) {
      const interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [emailTimer, emailVerified]);

  const handleManualVerify = () => {
    void submitVerification(emailCode, "manual");
  };

  const handleCodeChange = (previousCode: string, value: string) => {
    if (value !== previousCode) {
      resetSubmissionState();
    }

    setEmailCode(value);
    setSubmitError(null);
    validation.handleChange("verificationCode", value);

    if (shouldTriggerAutoSubmit(previousCode, value)) {
      void submitVerification(value, "auto");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    handleCodeChange(emailCode, pasted);
  };

  const handleResendEmail = async () => {
    if (!data.email || emailTimer > 0) {
      return;
    }

    try {
      await apiFetch("/auth/verification/resend", {
        method: "POST",
        body: JSON.stringify({ email: data.email }),
      });
      setEmailTimer(60);
      setEmailCode("");
      setSubmitError(null);
      resetSubmissionState();
      inputRef.current?.focus();
    } catch (error) {
      setSubmitError(mapVerificationError(error));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const hasError =
    Boolean(submitError) ||
    validation.showError("verificationCode");
  const errorMessage =
    submitError ?? validation.getError("verificationCode");

  const canVerify =
    canManualSubmitVerification({
      code: emailCode,
      emailVerified,
      isSubmitting,
    });

  const successCopy =
    data.role === "AGENT"
      ? {
          title: "¡Tu cuenta está lista!",
          subtitle: "Ya creamos tu perfil de agente. Bienvenido a Propie.",
          theme: REGISTER_COMPLETION.AGENT,
        }
      : data.role === "CLIENT"
        ? {
            title: "¡Tu cuenta está lista!",
            subtitle: "Ya creamos tu perfil. Bienvenido a Propie.",
            theme: REGISTER_COMPLETION.OWNER,
          }
        : {
            title: "¡Tu cuenta está lista!",
            subtitle: "Ya creamos tu perfil de propietario. Bienvenido a Propie.",
            theme: REGISTER_COMPLETION.OWNER,
          };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#f5f5f7", fontFamily: "'Inter', sans-serif" }}>
      <RegisterSuccessOverlay
        open={showSuccess}
        variant={successVariant}
        title={successCopy.title}
        subtitle={successCopy.subtitle}
        onFinish={() => {
          setShowSuccess(false);
          reset();
          navigate("/explorar", { replace: true });
        }}
      />

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
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6e6e73" }}>
                  Enviado a {maskEmail(data.email)}
                </p>
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
                  handleCodeChange(emailCode, value);
                }}
                onBlur={() => validation.handleBlur("verificationCode")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (canVerify) {
                      handleManualVerify();
                    }
                  }
                }}
                onPaste={handlePaste}
                placeholder="000000"
                disabled={emailVerified || isSubmitting}
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
              <button
                type="button"
                onClick={handleManualVerify}
                disabled={!canVerify}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "none",
                  background: canVerify ? theme.primary : "#d1d1d6",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canVerify ? "pointer" : "not-allowed",
                }}
              >
                {isSubmitting ? "Verificando…" : "Verificar"}
              </button>
            )}

            {!emailVerified && (
              <div style={{ marginTop: 12, textAlign: "center", fontSize: 13 }}>
                {emailTimer > 0 ? (
                  <span style={{ color: "#9a9aa0" }}>
                    Reenviar código en <span style={{ fontWeight: 600, color: theme.primary }}>{formatTime(emailTimer)}</span>
                  </span>
                ) : (
                  <button onClick={() => void handleResendEmail()} type="button" style={{ background: "transparent", border: "none", color: theme.primary, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                    Reenviar código
                  </button>
                )}
              </div>
            )}
          </div>

          {isSubmitting && (
            <p style={{ margin: 0, textAlign: "center", color: "#6e6e73", fontSize: 13 }}>
              Verificando código…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
