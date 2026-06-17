import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import type { RegisterData } from "../../../context/RegisterContext";
import { useAccountCreationValidation } from "../hooks/useAccountCreationValidation";
import {
  FieldError,
  PasswordStrengthIndicator,
  ValidationSummary,
  fieldAriaProps,
  getFieldBorder,
} from "../validation";

type ThemeColors = {
  primary: string;
  focusShadow: string;
};

type AccountCreationFormProps = {
  data: RegisterData;
  updateData: (values: Partial<RegisterData>) => void;
  theme: ThemeColors;
  onValidSubmit: () => void;
  registrationKind?: "owner" | "client" | "agent";
  /** Streamlined onboarding: email + password only */
  minimal?: boolean;
};

export function AccountCreationForm({
  data,
  updateData,
  theme,
  onValidSubmit,
  minimal = true,
}: AccountCreationFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { validation, passwordStrength, normalizeEmail } =
    useAccountCreationValidation(data, { minimal });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validation.handleSubmit();
    if (!result.valid) return;
    onValidSubmit();
  };

  const fieldState = (field: string, value: string | boolean) => {
    if (validation.showError(field)) return "error" as const;
    if (typeof value === "string" ? value.trim() : value) {
      const noError = !validation.getError(field);
      if (noError && validation.touched[field]) return "success" as const;
    }
    return "default" as const;
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
      {validation.submitted && validation.errorList.length > 0 && (
        <ValidationSummary errors={validation.errorList} />
      )}

      {!minimal ? (
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
              onChange={(e) => {
                updateData({ firstName: e.target.value });
                validation.handleChange("firstName", e.target.value);
              }}
              onBlur={() => validation.handleBlur("firstName")}
              placeholder="Tu nombre"
              style={{
                width: "100%",
                padding: "14px 48px 14px 16px",
                borderRadius: 14,
                border: getFieldBorder(fieldState("firstName", data.firstName)),
                fontSize: 15,
                color: "#1a1a1a",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              {...fieldAriaProps("firstName", validation.showError("firstName"), "firstName-error")}
            />
            {fieldState("firstName", data.firstName) === "success" && (
              <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
                <Check size={18} color="#34C759" strokeWidth={2.5} />
              </div>
            )}
          </div>
          <FieldError id="firstName-error" message={validation.getError("firstName")} />
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
              onChange={(e) => {
                updateData({ lastName: e.target.value });
                validation.handleChange("lastName", e.target.value);
              }}
              onBlur={() => validation.handleBlur("lastName")}
              placeholder="Tu apellido"
              style={{
                width: "100%",
                padding: "14px 48px 14px 16px",
                borderRadius: 14,
                border: getFieldBorder(fieldState("lastName", data.lastName)),
                fontSize: 15,
                color: "#1a1a1a",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              {...fieldAriaProps("lastName", validation.showError("lastName"), "lastName-error")}
            />
            {fieldState("lastName", data.lastName) === "success" && (
              <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
                <Check size={18} color="#34C759" strokeWidth={2.5} />
              </div>
            )}
          </div>
          <FieldError id="lastName-error" message={validation.getError("lastName")} />
        </div>
      </div>
      ) : null}

      <div>
        <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
          Email
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => {
              updateData({ email: e.target.value });
              validation.handleChange("email", e.target.value);
            }}
            onBlur={() => {
              const normalized = normalizeEmail(data.email);
              if (normalized !== data.email) updateData({ email: normalized });
              validation.handleBlur("email");
            }}
            placeholder="tu@email.com"
            style={{
              width: "100%",
              padding: "14px 48px 14px 16px",
              borderRadius: 14,
              border: getFieldBorder(fieldState("email", data.email)),
              fontSize: 15,
              color: "#1a1a1a",
              outline: "none",
              transition: "all 0.15s ease",
              boxSizing: "border-box",
            }}
            {...fieldAriaProps("email", validation.showError("email"), "email-error")}
          />
          {fieldState("email", data.email) === "success" && (
            <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
              <Check size={18} color="#34C759" strokeWidth={2.5} />
            </div>
          )}
        </div>
        <FieldError id="email-error" message={validation.getError("email")} />
      </div>

      <div>
        <label htmlFor="password" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
          Contraseña
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={data.password}
            onChange={(e) => {
              updateData({ password: e.target.value });
              validation.handleChange("password", e.target.value);
            }}
            onBlur={() => validation.handleBlur("password")}
            placeholder="Mínimo 8 caracteres"
            style={{
              width: "100%",
              padding: "14px 80px 14px 16px",
              borderRadius: 14,
              border: getFieldBorder(fieldState("password", data.password)),
              fontSize: 15,
              color: "#1a1a1a",
              outline: "none",
              transition: "all 0.15s ease",
              boxSizing: "border-box",
            }}
            {...fieldAriaProps("password", validation.showError("password"), "password-error")}
          />
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 6, alignItems: "center" }}>
            {fieldState("password", data.password) === "success" && (
              <Check size={18} color="#34C759" strokeWidth={2.5} />
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar clave" : "Ver clave"}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 8, color: "#9a9aa0" }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <FieldError id="password-error" message={validation.getError("password")} />
        <PasswordStrengthIndicator strength={passwordStrength} />
      </div>

      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>
          <input
            type="checkbox"
            checked={data.acceptTerms}
            data-testid="register-field-acceptTerms"
            onChange={(e) => {
              updateData({ acceptTerms: e.target.checked });
              validation.handleChange("acceptTerms", e.target.checked);
            }}
            onBlur={() => validation.handleBlur("acceptTerms")}
            style={{ width: 18, height: 18, marginTop: 2, cursor: "pointer", accentColor: theme.primary, flexShrink: 0 }}
            {...fieldAriaProps("acceptTerms", validation.showError("acceptTerms"))}
          />
          <span>
            Acepto los <span style={{ color: theme.primary, fontWeight: 600 }}>términos y condiciones</span>
          </span>
        </label>
        <FieldError message={validation.getError("acceptTerms")} />

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>
          <input
            type="checkbox"
            checked={data.acceptPrivacy}
            data-testid="register-field-acceptPrivacy"
            onChange={(e) => {
              updateData({ acceptPrivacy: e.target.checked });
              validation.handleChange("acceptPrivacy", e.target.checked);
            }}
            onBlur={() => validation.handleBlur("acceptPrivacy")}
            style={{ width: 18, height: 18, marginTop: 2, cursor: "pointer", accentColor: theme.primary, flexShrink: 0 }}
            {...fieldAriaProps("acceptPrivacy", validation.showError("acceptPrivacy"))}
          />
          <span>
            Acepto la <span style={{ color: theme.primary, fontWeight: 600 }}>política de privacidad</span>
          </span>
        </label>
        <FieldError message={validation.getError("acceptPrivacy")} />
      </div>

      <button
        type="submit"
        disabled={!validation.isValid}
        data-testid="register-continue"
        style={{
          width: "100%",
          background: validation.isValid ? theme.primary : "#e5e5ea",
          border: "none",
          borderRadius: 16,
          padding: "16px 18px",
          cursor: validation.isValid ? "pointer" : "not-allowed",
          fontSize: 16,
          fontWeight: 700,
          color: validation.isValid ? "white" : "#9a9aa0",
          transition: "all 0.18s ease",
          marginTop: 8,
        }}
      >
        Continuar con email
      </button>

      <p style={{ marginTop: 24, textAlign: "center", color: "#9a9aa0", fontSize: 12, lineHeight: 1.6 }}>
        ¿Ya tenés cuenta?{" "}
        <span onClick={() => navigate("/ingresar")} style={{ color: theme.primary, fontWeight: 600, cursor: "pointer" }}>
          Iniciá sesión
        </span>
      </p>
    </form>
  );
}
