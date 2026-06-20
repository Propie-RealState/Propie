import { useState, useRef, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { Check, Upload, Camera } from "lucide-react";
import { useRegister } from "../../context/RegisterContext";
import React from "react";
import { usePersonalDataValidation } from "../../features/register/hooks/usePersonalDataValidation";
import {
  FieldError,
  ValidationSummary,
  fieldAriaProps,
  getFieldBorder,
  validateImageFile,
  validatePersonalDataStep,
  type RegisterRedirectState,
} from "../../features/register/validation";

export default function RegisterPersonalData() {
  const { data, updateData } = useRegister();
  const isAgent = data.role === "AGENT";
  const navigate = useNavigate();
  const location = useLocation();
  const [dniFront, setDniFront] = useState<File | null>(null);
  const [dniBack, setDniBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string, string | undefined>>({});
  const [showFinalSubmitNotice, setShowFinalSubmitNotice] = useState(false);

  const colors = {
    gradient: isAgent
      ? "linear-gradient(160deg, #FF8C5B 0%, #C52E3E 55%, #A82534 100%)"
      : "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
    primary: isAgent ? "#C52E3E" : "#4417E6",
    primaryDark: isAgent ? "#A82534" : "#3510B8",
    buttonShadow: isAgent ? "0 4px 16px rgba(197,46,62,0.24)" : "0 4px 16px rgba(68,23,230,0.24)",
    buttonHoverShadow: isAgent ? "0 6px 20px rgba(197,46,62,0.32)" : "0 6px 20px rgba(68,23,230,0.32)",
  };

  const dniFrontRef = useRef<HTMLInputElement>(null);
  const dniBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const personalContext = useMemo(
    () => ({ isAgent, dniFrontImage: dniFront, dniBackImage: dniBack, biometricSelfie: selfie }),
    [isAgent, dniFront, dniBack, selfie],
  );

  const validation = usePersonalDataValidation(data, personalContext);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const state = location.state as RegisterRedirectState | null;
    const redirectErrors = state?.registerFieldErrors;
    if (!redirectErrors || Object.keys(redirectErrors).length === 0) return;
    validation.seedFieldErrors(redirectErrors);
    setShowFinalSubmitNotice(Boolean(state?.fromFinalSubmit));
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once from router state
  }, [location.state]);

  const handleFileChange = (
    field: "dniFrontImage" | "dniBackImage" | "biometricSelfie",
    file: File | null,
    setter: (f: File | null) => void,
  ) => {
    const result = validateImageFile(file);
    setFileErrors((prev) => ({ ...prev, [field]: result.valid ? undefined : result.error }));
    if (result.valid) setter(file);
    else setter(null);
    validation.handleChange(field, file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const readField = (id: string, fallback: string) => {
      const dom = (form.querySelector(`#${id}`) as HTMLInputElement | null)?.value;
      return dom && dom.length > 0 ? dom : fallback;
    };
    const draft = {
      ...dataRef.current,
      dni: readField("dni", dataRef.current.dni),
      birthDate: readField("birthDate", dataRef.current.birthDate),
      nationality: readField("nationality", dataRef.current.nationality),
      cuitCuil: readField("cuitCuil", dataRef.current.cuitCuil),
      address: readField("address", dataRef.current.address),
      location: readField("location", dataRef.current.location || dataRef.current.address),
    };

    const stepResult = validatePersonalDataStep(draft, personalContext);
    validation.handleSubmit();
    if (!stepResult.valid) return;

    updateData({
      dni: draft.dni,
      birthDate: draft.birthDate,
      nationality: draft.nationality,
      cuitCuil: draft.cuitCuil,
      address: draft.address,
      location: draft.location || draft.address,
    });
    navigate("/registro/security");
  };

  const fieldState = (field: string) => {
    if (validation.showError(field) || fileErrors[field]) return "error" as const;
    const value = (data as Record<string, string>)[field];
    if (value && !validation.getError(field)) return "success" as const;
    if (field === "dniFrontImage" && dniFront) return "success" as const;
    if (field === "dniBackImage" && dniBack) return "success" as const;
    if (field === "biometricSelfie" && selfie) return "success" as const;
    return "default" as const;
  };

  const getFieldError = (field: string) => fileErrors[field] || validation.getError(field);

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#f5f5f7", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: "relative", background: colors.gradient, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 0 }}>
        <AuthHeroHeader />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 28px 12px" }}>
          <h1 style={{ color: "white", fontSize: "clamp(26px, 7vw, 34px)", fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.15, fontFamily: "'Sora', sans-serif", margin: 0 }}>
            Datos personales
          </h1>
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
                Faltan datos para crear tu cuenta. Completá los campos marcados y volvé a finalizar.
              </div>
            )}
            {validation.submitted && validation.errorList.length > 0 && (
              <ValidationSummary errors={validation.errorList} />
            )}

            <div>
              <label htmlFor="dni" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>DNI</label>
              <div style={{ position: "relative" }}>
                <input
                  id="dni"
                  type="text"
                  inputMode="numeric"
                  value={data.dni}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                    updateData({ dni: value });
                    validation.handleChange("dni", value);
                  }}
                  onBlur={() => validation.handleBlur("dni")}
                  placeholder="12345678"
                  style={{ width: "100%", padding: "14px 48px 14px 16px", borderRadius: 14, border: getFieldBorder(fieldState("dni")), fontSize: 15, color: "#1a1a1a", outline: "none", boxSizing: "border-box" }}
                  {...fieldAriaProps("dni", validation.showError("dni"), "dni-error")}
                />
                {fieldState("dni") === "success" && (
                  <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
                    <Check size={18} color="#34C759" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <FieldError id="dni-error" message={getFieldError("dni")} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="birthDate" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>Fecha de nacimiento</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="birthDate"
                    type="date"
                    value={data.birthDate}
                    onChange={(e) => { updateData({ birthDate: e.target.value }); validation.handleChange("birthDate", e.target.value); }}
                    onBlur={() => validation.handleBlur("birthDate")}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: getFieldBorder(fieldState("birthDate")), fontSize: 15, color: "#1a1a1a", outline: "none", boxSizing: "border-box" }}
                    {...fieldAriaProps("birthDate", validation.showError("birthDate"), "birthDate-error")}
                  />
                </div>
                <FieldError id="birthDate-error" message={getFieldError("birthDate")} />
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="nationality" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>Nacionalidad</label>
                <input
                  id="nationality"
                  type="text"
                  value={data.nationality}
                  onChange={(e) => { updateData({ nationality: e.target.value }); validation.handleChange("nationality", e.target.value); }}
                  onBlur={() => validation.handleBlur("nationality")}
                  placeholder="Argentina"
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: getFieldBorder(fieldState("nationality")), fontSize: 15, color: "#1a1a1a", outline: "none", boxSizing: "border-box" }}
                  {...fieldAriaProps("nationality", validation.showError("nationality"), "nationality-error")}
                />
                <FieldError id="nationality-error" message={getFieldError("nationality")} />
              </div>
            </div>

            <div>
              <label htmlFor="cuitCuil" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>CUIT/CUIL</label>
              <div style={{ position: "relative" }}>
                <input
                  id="cuitCuil"
                  type="text"
                  inputMode="numeric"
                  value={data.cuitCuil}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                    updateData({ cuitCuil: value });
                    validation.handleChange("cuitCuil", value);
                  }}
                  onBlur={() => validation.handleBlur("cuitCuil")}
                  placeholder="20123456789"
                  style={{ width: "100%", padding: "14px 48px 14px 16px", borderRadius: 14, border: getFieldBorder(fieldState("cuitCuil")), fontSize: 15, color: "#1a1a1a", outline: "none", boxSizing: "border-box" }}
                  {...fieldAriaProps("cuitCuil", validation.showError("cuitCuil"), "cuitCuil-error")}
                />
                {fieldState("cuitCuil") === "success" && (
                  <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
                    <Check size={18} color="#34C759" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <FieldError id="cuitCuil-error" message={getFieldError("cuitCuil")} />
            </div>

            <div>
              <label htmlFor="address" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>Dirección</label>
              <input
                id="address"
                type="text"
                value={data.address}
                onChange={(e) => {
                  const value = e.target.value;
                  updateData({ address: value, location: data.location || value });
                  validation.handleChange("address", value);
                }}
                onBlur={() => validation.handleBlur("address")}
                placeholder="Calle y número"
                autoComplete="street-address"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: getFieldBorder(fieldState("address")), fontSize: 15, color: "#1a1a1a", outline: "none", boxSizing: "border-box" }}
                {...fieldAriaProps("address", validation.showError("address"), "address-error")}
              />
              <FieldError id="address-error" message={getFieldError("address")} />
            </div>

            <div>
              <label htmlFor="location" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>Ciudad / zona</label>
              <input
                id="location"
                type="text"
                value={data.location}
                onChange={(e) => {
                  updateData({ location: e.target.value });
                  validation.handleChange("location", e.target.value);
                }}
                onBlur={() => validation.handleBlur("location")}
                placeholder="Buenos Aires"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: getFieldBorder(fieldState("location")), fontSize: 15, color: "#1a1a1a", outline: "none", boxSizing: "border-box" }}
                {...fieldAriaProps("location", validation.showError("location"), "location-error")}
              />
              <FieldError id="location-error" message={getFieldError("location")} />
            </div>

            {isAgent && (
              <>
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>Validación documental</h3>

                  {(["dniFrontImage", "dniBackImage"] as const).map((field, idx) => {
                    const label = idx === 0 ? "Frente DNI" : "Dorso DNI";
                    const ref = idx === 0 ? dniFrontRef : dniBackRef;
                    const file = idx === 0 ? dniFront : dniBack;
                    const setter = idx === 0 ? setDniFront : setDniBack;
                    return (
                      <div key={field} style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>{label}</label>
                        <input ref={ref} type="file" accept="image/*" onChange={(e) => handleFileChange(field, e.target.files?.[0] ?? null, setter)} style={{ display: "none" }} data-testid={`register-field-${field}`} />
                        <button type="button" onClick={() => ref.current?.click()} style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: getFieldBorder(fieldState(field)), background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 15, color: file ? "#1a1a1a" : "#9a9aa0" }}>{file ? file.name : "Seleccionar archivo"}</span>
                          {file ? <Check size={20} color="#34C759" /> : <Upload size={20} color="#9a9aa0" />}
                        </button>
                        <FieldError message={getFieldError(field)} />
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>Validación biométrica</h3>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>Selfie facial</label>
                  <input ref={selfieRef} type="file" accept="image/*" capture="user" onChange={(e) => handleFileChange("biometricSelfie", e.target.files?.[0] ?? null, setSelfie)} style={{ display: "none" }} data-testid="register-field-biometricSelfie" />
                  <button type="button" onClick={() => selfieRef.current?.click()} style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: getFieldBorder(fieldState("biometricSelfie")), background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 15, color: selfie ? "#1a1a1a" : "#9a9aa0" }}>{selfie ? selfie.name : "Tomar selfie"}</span>
                    {selfie ? <Check size={20} color="#34C759" /> : <Camera size={20} color="#9a9aa0" />}
                  </button>
                  <FieldError message={getFieldError("biometricSelfie")} />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={!validation.isValid}
              data-testid="register-continue"
              style={{
                width: "100%",
                background: validation.isValid ? colors.primary : "#e5e5ea",
                border: "none",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: validation.isValid ? "pointer" : "not-allowed",
                fontSize: 16,
                fontWeight: 700,
                color: validation.isValid ? "white" : "#9a9aa0",
                marginTop: 16,
                boxShadow: validation.isValid ? colors.buttonShadow : "none",
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
