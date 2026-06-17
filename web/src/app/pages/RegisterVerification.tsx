import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { Mail, Check } from "lucide-react";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { useAuth } from "../../context/AuthContext";
import { getAppTheme } from "../../theme/app-theme";
import { RegisterSuccessOverlay } from "../components/register/RegisterSuccessOverlay";
import { OwnerWelcomeModal } from "../components/onboarding/OwnerWelcomeModal";
import { completeRegistration } from "../../features/register/services/complete-registration";
import { navigateAfterAuth } from "../../lib/onboarding/post-registration-navigation";
import { usePropertyPublish } from "../modules/publish/context/PropertyPublishContext";
import {
  FieldError,
  fieldAriaProps,
  getFieldBorder,
  handleRegisterValidationFailure,
  useFormValidation,
  validateVerificationCode,
  validateVerificationStep,
  validateBasicProfileStep,
  validateUnifiedAccountStep,
} from "../../features/register/validation";

const SUCCESS_COPY = {
  CLIENT: {
    title: "¡Listo para explorar!",
    subtitle: "Guardá favoritos, contactá publicadores y agendá visitas cuando quieras.",
    variant: "OWNER" as const,
  },
  OWNER: {
    title: "¡Tu cuenta está lista!",
    subtitle: "Siguiente paso: publicá tu propiedad y empezá a recibir consultas.",
    variant: "OWNER" as const,
  },
  AGENT: {
    title: "¡Bienvenido, agente!",
    subtitle: "Completá tu perfil y solicitá propiedades para comercializar.",
    variant: "AGENT" as const,
  },
};

export default function RegisterVerification() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data, updateData, reset } = useRegister();
  const [emailCode, setEmailCode] = useState(data.verificationCode || "");
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailVerified, setEmailVerified] = useState(false);
  const [invalidAttempt, setInvalidAttempt] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOwnerWelcome, setShowOwnerWelcome] = useState(false);
  const [completedRole, setCompletedRole] = useState<"CLIENT" | "OWNER" | "AGENT">("CLIENT");
  const { startCreatePublish } = usePropertyPublish();
  const inputRef = useRef<HTMLInputElement>(null);
  const advanceStartedRef = useRef(false);
  const lastSubmittedCodeRef = useRef<string | null>(null);

  const theme = getAppTheme(data.role === "AGENT");
  const isDev = import.meta.env.DEV;

  const getValues = useCallback(() => ({ verificationCode: emailCode }), [emailCode]);
  const validateAll = useCallback(() => validateVerificationStep(emailCode), [emailCode]);
  const validation = useFormValidation(getValues, validateAll);

  const maskedEmail = data.email
    ? `${data.email.slice(0, 2)}••••@${data.email.split("@")[1] ?? "email.com"}`
    : "tu correo";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (emailVerified) return;
    if (!data.role) {
      navigate("/registro", { replace: true });
      return;
    }
    const account = validateUnifiedAccountStep(data);
    if (!account.valid) {
      navigate("/registro/account", { replace: true });
      return;
    }
    const profile = validateBasicProfileStep(data);
    if (!profile.valid) {
      navigate("/registro/profile", { replace: true });
    }
  }, [data, emailVerified, navigate]);

  useEffect(() => {
    if (emailTimer > 0 && !emailVerified) {
      const interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [emailTimer, emailVerified]);

  const finishRegistration = useCallback(async (code: string) => {
    if (isSubmitting || advanceStartedRef.current) return;
    advanceStartedRef.current = true;
    setIsSubmitting(true);

    try {
      updateData({ verificationCode: code, verifiedAt: new Date().toISOString() });
      const registrationData = { ...data, verificationCode: code, verifiedAt: new Date().toISOString() };
      const result = await completeRegistration(registrationData, auth);
      setCompletedRole(result.role);
      setEmailVerified(true);
      if (result.role === "OWNER") {
        setShowOwnerWelcome(true);
      } else {
        setShowSuccess(true);
      }
    } catch (error) {
      advanceStartedRef.current = false;
      if (handleRegisterValidationFailure(error, data, navigate)) {
        return;
      }

      const statusCode =
        typeof error === "object" && error !== null
          ? (error as { statusCode?: number }).statusCode
          : undefined;

      if (statusCode === 429) {
        setApiError(
          "Demasiados intentos. Reiniciá el servidor de desarrollo o esperá unos minutos.",
        );
        setInvalidAttempt(false);
      } else {
        setApiError(
          "No pudimos crear tu cuenta. Revisá los datos e intentá de nuevo.",
        );
        setInvalidAttempt(false);
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [auth, data, isSubmitting, navigate, reset, updateData]);

  useEffect(() => {
    if (emailCode.length !== 6 || emailVerified || isSubmitting) {
      if (emailCode.length !== 6) {
        setInvalidAttempt(false);
        setApiError(null);
        lastSubmittedCodeRef.current = null;
      }
      return;
    }

    if (lastSubmittedCodeRef.current === emailCode) {
      return;
    }

    const result = validateVerificationCode(emailCode);
    if (!result.valid) {
      setInvalidAttempt(true);
      setApiError(null);
      validation.handleBlur("verificationCode");
      return;
    }

    lastSubmittedCodeRef.current = emailCode;
    void finishRegistration(emailCode);
    // validation omitted intentionally — including it retriggers submission after failures
  }, [emailCode, emailVerified, finishRegistration, isSubmitting]);

  const handleSuccessFinish = useCallback(() => {
    setShowSuccess(false);
    reset();
    navigateAfterAuth(completedRole, navigate, { replace: true });
  }, [completedRole, navigate, reset]);

  const handleOwnerExplore = useCallback(() => {
    setShowOwnerWelcome(false);
    reset();
    navigate("/explore", { replace: true });
  }, [navigate, reset]);

  const handleOwnerPublish = useCallback(() => {
    setShowOwnerWelcome(false);
    reset();
    startCreatePublish();
    navigate("/publicar", { replace: true });
  }, [navigate, reset, startCreatePublish]);

  const handleResendEmail = () => {
    setEmailTimer(60);
    setEmailCode("");
    setInvalidAttempt(false);
    setApiError(null);
    advanceStartedRef.current = false;
    lastSubmittedCodeRef.current = null;
    inputRef.current?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const hasError =
    validation.showError("verificationCode") || invalidAttempt || Boolean(apiError);
  const errorMessage =
    apiError ??
    (invalidAttempt
      ? "Código incorrecto. Revisá tu email e intentá de nuevo."
      : validation.getError("verificationCode"));

  const successCopy = SUCCESS_COPY[completedRole];

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#f5f5f7", fontFamily: "'Inter', sans-serif" }}>
      <OwnerWelcomeModal
        open={showOwnerWelcome}
        onExplore={handleOwnerExplore}
        onPublish={handleOwnerPublish}
      />

      <RegisterSuccessOverlay
        open={showSuccess}
        variant={successCopy.variant}
        title={successCopy.title}
        subtitle={successCopy.subtitle}
        onFinish={handleSuccessFinish}
      />

      <div style={{ position: "relative", background: theme.heroGradient, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 0 }}>
        <AuthHeroHeader />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 28px 12px" }}>
          <h1 style={{ color: "white", fontSize: "clamp(26px, 7vw, 34px)", fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.15, fontFamily: "'Sora', sans-serif", margin: 0 }}>
            Verificá tu email
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Ingresá el código de 6 dígitos que enviamos a {maskedEmail}
          </p>
        </div>
        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}>
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
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
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>Código de verificación</h3>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6e6e73" }}>Válido por 10 minutos</p>
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
                  setApiError(null);
                  lastSubmittedCodeRef.current = null;
                  advanceStartedRef.current = false;
                  validation.handleChange("verificationCode", value);
                }}
                onBlur={() => validation.handleBlur("verificationCode")}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  setEmailCode(pasted);
                  validation.handleChange("verificationCode", pasted);
                }}
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

            {isSubmitting ? (
              <p style={{ marginTop: 12, textAlign: "center", fontSize: 13, color: theme.primary, fontWeight: 600 }}>
                Creando tu cuenta...
              </p>
            ) : null}

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

          {isDev ? (
            <p style={{ marginTop: 4, textAlign: "center", color: "#9a9aa0", fontSize: 12, lineHeight: 1.6 }}>
              Entorno de desarrollo: el código de prueba es{" "}
              <span style={{ fontWeight: 600, color: theme.primary }}>123456</span>
            </p>
          ) : (
            <p style={{ marginTop: 4, textAlign: "center", color: "#9a9aa0", fontSize: 12, lineHeight: 1.6 }}>
              ¿No llegó? Revisá spam o solicitá un nuevo código.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
