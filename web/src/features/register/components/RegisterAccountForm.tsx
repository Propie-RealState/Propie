import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import type { RegisterData } from "../../../context/RegisterContext";
import { useUnifiedAccountValidation } from "../hooks/useUnifiedAccountValidation";
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

type Props = {
  data: RegisterData;
  updateData: (values: Partial<RegisterData>) => void;
  theme: ThemeColors;
  onValidSubmit: () => void;
};

export function RegisterAccountForm({ data, updateData, theme, onValidSubmit }: Props) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { validation, passwordStrength, normalizeEmail } = useUnifiedAccountValidation(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validation.handleSubmit();
    if (!result.valid) return;
    onValidSubmit();
  };

  const fieldState = (field: string, value: string) => {
    if (validation.showError(field)) return "error" as const;
    if (value.trim() && !validation.getError(field) && validation.touched[field]) {
      return "success" as const;
    }
    return "default" as const;
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
      {validation.submitted && validation.errorList.length > 0 && (
        <ValidationSummary errors={validation.errorList} />
      )}

      <div>
        <label htmlFor="email" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
          Email
        </label>
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
            padding: "14px 16px",
            borderRadius: 14,
            border: getFieldBorder(fieldState("email", data.email)),
            fontSize: 15,
            boxSizing: "border-box",
          }}
          {...fieldAriaProps("email", validation.showError("email"), "email-error")}
        />
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
            data-testid="register-field-password"
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
              boxSizing: "border-box",
            }}
            {...fieldAriaProps("password", validation.showError("password"), "password-error")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar clave" : "Ver clave"}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 8,
              color: "#9a9aa0",
            }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <FieldError id="password-error" message={validation.getError("password")} />
        <PasswordStrengthIndicator strength={passwordStrength} />
      </div>

      <div>
        <label htmlFor="confirmPassword" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
          Confirmar contraseña
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            data-testid="register-field-confirmPassword"
            value={data.confirmPassword}
            onChange={(e) => {
              updateData({ confirmPassword: e.target.value });
              validation.handleChange("confirmPassword", e.target.value);
            }}
            onBlur={() => validation.handleBlur("confirmPassword")}
            placeholder="Repetí tu contraseña"
            style={{
              width: "100%",
              padding: "14px 80px 14px 16px",
              borderRadius: 14,
              border: getFieldBorder(fieldState("confirmPassword", data.confirmPassword)),
              fontSize: 15,
              boxSizing: "border-box",
            }}
            {...fieldAriaProps(
              "confirmPassword",
              validation.showError("confirmPassword"),
              "confirmPassword-error",
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Ocultar confirmación" : "Ver confirmación"}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 8,
              color: "#9a9aa0",
            }}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {fieldState("confirmPassword", data.confirmPassword) === "success" && (
            <div style={{ position: "absolute", right: 44, top: "50%", transform: "translateY(-50%)" }}>
              <Check size={18} color="#34C759" strokeWidth={2.5} />
            </div>
          )}
        </div>
        <FieldError id="confirmPassword-error" message={validation.getError("confirmPassword")} />
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
          marginTop: 8,
        }}
      >
        Continuar
      </button>

      <p style={{ marginTop: 16, textAlign: "center", color: "#9a9aa0", fontSize: 12 }}>
        ¿Ya tenés cuenta?{" "}
        <button
          type="button"
          onClick={() => navigate("/ingresar")}
          style={{ background: "none", border: "none", color: theme.primary, fontWeight: 600, cursor: "pointer", padding: 0 }}
        >
          Iniciá sesión
        </button>
      </p>
    </form>
  );
}
