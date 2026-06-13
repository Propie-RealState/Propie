import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { Check, Shield, Fingerprint, Lock, Mail, Smartphone } from "lucide-react";
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
  normalizeEmail,
} from "../../features/register/validation";

export default function RegisterSecurity() {
  const { data, updateData } = useRegister();
  const navigate = useNavigate();
  const theme = getAppTheme(data.role === "AGENT");
  const { validation, showSuccess, successMessage } = useSecurityValidation(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validation.handleSubmit();
    if (!result.valid) return;
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
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>Protegé tu cuenta con medidas de seguridad adicionales</p>
        </div>
        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}>
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 40px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
            {validation.submitted && validation.errorList.length > 0 && <ValidationSummary errors={validation.errorList} />}
            <SecuritySuccessBanner visible={showSuccess} message={successMessage} />

            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>Activar seguridad</h3>
              {[
                { key: "twoFactorEnabled" as const, icon: Shield, title: "Autenticación 2FA", desc: "Código adicional al iniciar sesión" },
                { key: "biometricEnabled" as const, icon: Fingerprint, title: "Biometría", desc: "Huella digital o reconocimiento facial" },
              ].map(({ key, icon: Icon, title, desc }) => (
                <div key={key} style={{ background: "white", borderRadius: 16, padding: "18px", marginBottom: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.04)", border: "1.5px solid #e5e5ea" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={theme.primary} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{title}</h4>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6e6e73" }}>{desc}</p>
                    </div>
                    <label style={{ position: "relative", display: "inline-block", width: 48, height: 28 }}>
                      <input type="checkbox" checked={data[key]} onChange={(e) => updateData({ [key]: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: "absolute", cursor: "pointer", inset: 0, background: data[key] ? theme.primary : "#e5e5ea", borderRadius: 28, transition: "0.3s" }}>
                        <span style={{ position: "absolute", height: 22, width: 22, left: data[key] ? 23 : 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
                      </span>
                    </label>
                  </div>
                </div>
              ))}

              <div style={{ background: "white", borderRadius: 16, padding: "18px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", border: "1.5px solid #e5e5ea" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Lock size={20} color={theme.primary} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>PIN de seguridad</h4>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6e6e73" }}>Código de 4 dígitos</p>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: 48, height: 28 }}>
                    <input type="checkbox" checked={data.pinEnabled} data-testid="register-field-pinEnabled" onChange={(e) => updateData({ pinEnabled: e.target.checked, pin: e.target.checked ? data.pin : "" })} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: "absolute", cursor: "pointer", inset: 0, background: data.pinEnabled ? theme.primary : "#e5e5ea", borderRadius: 28, transition: "0.3s" }}>
                      <span style={{ position: "absolute", height: 22, width: 22, left: data.pinEnabled ? 23 : 3, bottom: 3, background: "white", borderRadius: "50%", transition: "0.3s" }} />
                    </span>
                  </label>
                </div>
                {data.pinEnabled && (
                  <div style={{ marginTop: 16 }}>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={data.pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                        updateData({ pin: value });
                        validation.handleChange("pin", value);
                      }}
                      onBlur={() => validation.handleBlur("pin")}
                      placeholder="Ingresá tu PIN de 4 dígitos"
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: getFieldBorder(fieldState("pin", data.pin)), fontSize: 15, outline: "none", boxSizing: "border-box" }}
                      {...fieldAriaProps("pin", validation.showError("pin"), "pin-error")}
                    />
                    <FieldError id="pin-error" message={validation.getError("pin")} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>Opciones de recuperación</h3>

              <div style={{ marginBottom: 12 }}>
                <label htmlFor="recoveryEmail" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>Email de recuperación</label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} color="#9a9aa0" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    id="recoveryEmail"
                    type="email"
                    value={data.recoveryEmail}
                    onChange={(e) => { updateData({ recoveryEmail: e.target.value }); validation.handleChange("recoveryEmail", e.target.value); }}
                    onBlur={() => { const n = normalizeEmail(data.recoveryEmail); if (n !== data.recoveryEmail) updateData({ recoveryEmail: n }); validation.handleBlur("recoveryEmail"); }}
                    placeholder="recuperacion@email.com"
                    style={{ width: "100%", padding: "14px 48px 14px 46px", borderRadius: 14, border: getFieldBorder(fieldState("recoveryEmail", data.recoveryEmail)), fontSize: 15, outline: "none", boxSizing: "border-box" }}
                    {...fieldAriaProps("recoveryEmail", validation.showError("recoveryEmail"), "recoveryEmail-error")}
                  />
                  {fieldState("recoveryEmail", data.recoveryEmail) === "success" && <Check size={18} color="#34C759" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }} />}
                </div>
                <FieldError id="recoveryEmail-error" message={validation.getError("recoveryEmail")} />
              </div>

              <div>
                <label htmlFor="recoveryPhone" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>Teléfono de recuperación</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ padding: "14px 16px", borderRadius: 14, border: "1.5px solid #e5e5ea", fontSize: 15, background: "#f5f5f7", fontWeight: 600 }}>+54</div>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Smartphone size={18} color="#9a9aa0" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      id="recoveryPhone"
                      type="tel"
                      inputMode="numeric"
                      value={data.recoveryPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 15);
                        updateData({ recoveryPhone: value });
                        validation.handleChange("recoveryPhone", value);
                      }}
                      onBlur={() => validation.handleBlur("recoveryPhone")}
                      placeholder="11 2345 6789"
                      style={{ width: "100%", padding: "14px 48px 14px 46px", borderRadius: 14, border: getFieldBorder(fieldState("recoveryPhone", data.recoveryPhone)), fontSize: 15, outline: "none", boxSizing: "border-box" }}
                      {...fieldAriaProps("recoveryPhone", validation.showError("recoveryPhone"), "recoveryPhone-error")}
                    />
                    {fieldState("recoveryPhone", data.recoveryPhone) === "success" && <Check size={18} color="#34C759" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }} />}
                  </div>
                </div>
                <FieldError id="recoveryPhone-error" message={validation.getError("recoveryPhone")} />
              </div>
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
