import React, { useRef } from "react";
import { Camera, Check } from "lucide-react";
import type { RegisterData } from "../../../context/RegisterContext";
import { useBasicProfileValidation } from "../hooks/useBasicProfileValidation";
import {
  FieldError,
  ValidationSummary,
  fieldAriaProps,
  getFieldBorder,
  validateProfilePhotoFile,
  getMaxBirthDateForRegistration,
  getMinBirthDateForRegistration,
} from "../validation";

type ThemeColors = {
  primary: string;
};

type Props = {
  data: RegisterData;
  updateData: (values: Partial<RegisterData>) => void;
  theme: ThemeColors;
  onValidSubmit: () => void;
};

export function BasicProfileForm({ data, updateData, theme, onValidSubmit }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validation = useBasicProfileValidation(data);
  const [photoError, setPhotoError] = React.useState<string | undefined>();

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

  const handlePhotoChange = (file: File | null) => {
    if (!file) return;
    const result = validateProfilePhotoFile(file);
    if (!result.valid) {
      setPhotoError(result.error);
      return;
    }
    setPhotoError(undefined);
    const reader = new FileReader();
    reader.onload = () => {
      updateData({ profilePhoto: typeof reader.result === "string" ? reader.result : null });
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
      {validation.submitted && validation.errorList.length > 0 && (
        <ValidationSummary errors={validation.errorList} />
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        data-testid="register-field-profilePhoto"
        style={{
          alignSelf: "center",
          width: 96,
          height: 96,
          borderRadius: 24,
          border: "2px dashed #d1d1d6",
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {data.profilePhoto ? (
          <img src={data.profilePhoto} alt="Vista previa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <Camera size={22} color={theme.primary} />
            <span style={{ fontSize: 11, color: "#6e6e73", fontWeight: 600 }}>Foto (opcional)</span>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
      />
      <FieldError message={photoError} />

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="firstName" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Nombre
          </label>
          <input
            id="firstName"
            value={data.firstName}
            onChange={(e) => {
              updateData({ firstName: e.target.value });
              validation.handleChange("firstName", e.target.value);
            }}
            onBlur={() => validation.handleBlur("firstName")}
            placeholder="Tu nombre"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: getFieldBorder(fieldState("firstName", data.firstName)),
              fontSize: 15,
              boxSizing: "border-box",
            }}
            {...fieldAriaProps("firstName", validation.showError("firstName"), "firstName-error")}
          />
          <FieldError id="firstName-error" message={validation.getError("firstName")} />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="lastName" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Apellido
          </label>
          <input
            id="lastName"
            value={data.lastName}
            onChange={(e) => {
              updateData({ lastName: e.target.value });
              validation.handleChange("lastName", e.target.value);
            }}
            onBlur={() => validation.handleBlur("lastName")}
            placeholder="Tu apellido"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: getFieldBorder(fieldState("lastName", data.lastName)),
              fontSize: 15,
              boxSizing: "border-box",
            }}
            {...fieldAriaProps("lastName", validation.showError("lastName"), "lastName-error")}
          />
          <FieldError id="lastName-error" message={validation.getError("lastName")} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="birthDate" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Fecha de nacimiento
          </label>
          <input
            id="birthDate"
            type="date"
            data-testid="register-field-birthDate"
            value={data.birthDate}
            min={getMinBirthDateForRegistration()}
            max={getMaxBirthDateForRegistration()}
            onChange={(e) => {
              updateData({ birthDate: e.target.value, age: "" });
              validation.handleChange("birthDate", e.target.value);
            }}
            onBlur={() => validation.handleBlur("birthDate")}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: getFieldBorder(fieldState("birthDate", data.birthDate)),
              fontSize: 15,
              boxSizing: "border-box",
              color: data.birthDate ? "#1a1a1a" : "#6e6e73",
            }}
            {...fieldAriaProps("birthDate", validation.showError("birthDate"), "birthDate-error")}
          />
          <FieldError id="birthDate-error" message={validation.getError("birthDate")} />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="nationality" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Nacionalidad
          </label>
          <input
            id="nationality"
            value={data.nationality}
            onChange={(e) => {
              updateData({ nationality: e.target.value });
              validation.handleChange("nationality", e.target.value);
            }}
            onBlur={() => validation.handleBlur("nationality")}
            placeholder="Argentina"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: getFieldBorder(fieldState("nationality", data.nationality)),
              fontSize: 15,
              boxSizing: "border-box",
            }}
            {...fieldAriaProps("nationality", validation.showError("nationality"), "nationality-error")}
          />
          <FieldError id="nationality-error" message={validation.getError("nationality")} />
        </div>
      </div>

      <div>
        <label htmlFor="bio" style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Bio <span style={{ color: "#9a9aa0", fontWeight: 500 }}>(opcional)</span>
        </label>
        <textarea
          id="bio"
          value={data.bio}
          onChange={(e) => {
            updateData({ bio: e.target.value });
            validation.handleChange("bio", e.target.value);
          }}
          onBlur={() => validation.handleBlur("bio")}
          placeholder="Contanos un poco sobre vos"
          rows={3}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 14,
            border: getFieldBorder(fieldState("bio", data.bio)),
            fontSize: 15,
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <FieldError message={validation.getError("bio")} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={data.acceptTerms}
            data-testid="register-field-acceptTerms"
            onChange={(e) => {
              updateData({ acceptTerms: e.target.checked });
              validation.handleChange("acceptTerms", e.target.checked);
            }}
            style={{ width: 18, height: 18, marginTop: 2, accentColor: theme.primary }}
          />
          <span>Acepto los términos y condiciones</span>
        </label>
        <FieldError message={validation.getError("acceptTerms")} />
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={data.acceptPrivacy}
            data-testid="register-field-acceptPrivacy"
            onChange={(e) => {
              updateData({ acceptPrivacy: e.target.checked });
              validation.handleChange("acceptPrivacy", e.target.checked);
            }}
            style={{ width: 18, height: 18, marginTop: 2, accentColor: theme.primary }}
          />
          <span>Acepto la política de privacidad</span>
        </label>
        <FieldError message={validation.getError("acceptPrivacy")} />
      </div>

      <button
        type="submit"
        disabled={!validation.isValid}
        data-testid="register-create-account"
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
        Crear cuenta
      </button>
    </form>
  );
}
