import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { registerApiLimits } from "@propie/registration-validation";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { Check, Smartphone } from "lucide-react";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { getAppTheme } from "../../theme/app-theme";
import { useSecurityValidation } from "../../features/register/hooks/useSecurityValidation";
import {
  FieldError,
  SecuritySuccessBanner,
  ValidationSummary,
  fieldAriaProps,
  getFieldBorder,
  useRegisterRedirectErrors,
} from "../../features/register/validation";
import { advanceRegistrationProgress } from "../../features/register/registrationProgress";

export default function RegisterSecurity() {
  const { data, updateData } = useRegister();
  const navigate = useNavigate();
  const theme = getAppTheme(data.role === "AGENT");
  const { validation, showSuccess, successMessage } = useSecurityValidation(data);
  const { formError, showFinalSubmitNotice } = useRegisterRedirectErrors(
    validation.seedFieldErrors,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validation.handleSubmit();
    if (!result.valid) return;
    flushSync(() => {
      updateData({
        registrationProgress: advanceRegistrationProgress(
          data.registrationProgress,
          "security",
        ),
      });
    });
    navigate("/registro/profile-photo");
  };

  const fieldState = (field: string, value: string) => {
    if (validation.showError(field)) return "error" as const;
    if (value && !validation.getError(field) && validation.touched[field]) return "success" as const;
    return "default" as const;
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#f5f5f7", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: "relative", background: theme.heroGradient, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 0 }}>
        <AuthHeroHeader />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 28px 12px" }}>
          <h1 style={{ color: "white", fontSize: "clamp(26px, 7vw, 34px)", fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.15, fontFamily: "'Sora', sans-serif", margin: 0 }}>Seguridad de cuenta</h1>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 40px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
            {showFinalSubmitNotice && (
              <div
                role="status"
                style={{
                  background: "linear-gradient(135deg, #fff4f4 0%, #ffe8e8 100%)",
                  border: "1.5px solid #f5c2c7",
                  borderRadius: 14,
                  padding: "14px 16px",
                  fontSize: 14,
                  color: "#8b1e1e",
                  lineHeight: 1.5,
                }}
              >
                Revisá los datos marcados para poder crear tu cuenta.
              </div>
            )}
            {formError && <ValidationSummary errors={[formError]} />}
            {validation.submitted && validation.errorList.length > 0 && <ValidationSummary errors={validation.errorList} />}
            <SecuritySuccessBanner visible={showSuccess} message={successMessage} />

            <div>
              <label htmlFor="phone" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>Teléfono</label>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ padding: "14px 16px", borderRadius: 14, border: "1.5px solid #e5e5ea", fontSize: 15, background: "#f5f5f7", fontWeight: 600 }}>+54</div>
                <div style={{ position: "relative", flex: 1 }}>
                  <Smartphone size={18} color="#9a9aa0" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={data.phone}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, registerApiLimits.phone.max);
                      updateData({ phone: value });
                      validation.handleChange("phone", value);
                    }}
                    onBlur={() => validation.handleBlur("phone")}
                    placeholder="11 2345 6789"
                    style={{ width: "100%", padding: "14px 48px 14px 46px", borderRadius: 14, border: getFieldBorder(fieldState("phone", data.phone)), fontSize: 15, outline: "none", boxSizing: "border-box" }}
                    {...fieldAriaProps("phone", validation.showError("phone"), "phone-error")}
                  />
                  {fieldState("phone", data.phone) === "success" && <Check size={18} color="#34C759" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }} />}
                </div>
              </div>
              <FieldError id="phone-error" message={validation.getError("phone")} />
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
                marginTop: 16,
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
