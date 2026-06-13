import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { Upload, Camera, User } from "lucide-react";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { setPendingAvatarFile } from "../../lib/pending-avatar";
import {
  FieldError,
  validateProfilePhotoFile,
} from "../../features/register/validation";

export default function RegisterProfilePhoto() {
  const { data, updateData } = useRegister();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isAgent = data.role === "AGENT";

  const [uploadError, setUploadError] = useState<string | undefined>();

  const colors = {
    gradient: isAgent
      ? "linear-gradient(160deg, #FF8C5B 0%, #C52E3E 55%, #A82534 100%)"
      : "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
    primary: isAgent ? "#C52E3E" : "#4417E6",
    primaryDark: isAgent ? "#A82534" : "#3510B8",
    buttonShadow: isAgent ? "0 4px 16px rgba(197,46,62,0.24)" : "0 4px 16px rgba(68,23,230,0.24)",
    buttonHoverShadow: isAgent ? "0 6px 20px rgba(197,46,62,0.32)" : "0 6px 20px rgba(68,23,230,0.32)",
  };

  const handleFileSelect = (file: File) => {
    const result = validateProfilePhotoFile(file);
    if (!result.valid) {
      setUploadError(result.error);
      return;
    }
    setUploadError(undefined);
    setPendingAvatarFile(file);
    updateData({ ...data, profilePhoto: URL.createObjectURL(file) });
  };

  const handleContinue = () => {
    if (data.role === "AGENT") {
      navigate("/registro/agent-info");
    } else if (data.role === "CLIENT") {
      navigate("/registro/client-info");
    } else {
      navigate("/registro/owner-info");
    }
  };

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

        <AuthHeroHeader />

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
            Foto de perfil
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Agregá una foto para que otros te reconozcan
          </p>
        </div>

        {/* Wave */}
        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}>
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Photo preview */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: data.profilePhoto ? `url(${data.profilePhoto}) center/cover` : "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(68,23,230,0.15)",
                border: "4px solid white",
                overflow: "hidden",
              }}
            >
              {!data.profilePhoto && <User size={64} color={colors.primary} strokeWidth={1.5} />}
            </div>
          </div>

          {/* Upload options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Upload from files */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              style={{ display: "none" }}
              data-testid="register-field-profilePhoto"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontSize: 15,
                fontWeight: 600,
                color: "#1a1a1a",
                transition: "all 0.15s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = colors.primary;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(68,23,230,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              <Upload size={20} color={colors.primary} />
              Subir foto
            </button>

            {/* Take photo */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              capture="user"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={{
                width: "100%",
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontSize: 15,
                fontWeight: 600,
                color: "#1a1a1a",
                transition: "all 0.15s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = colors.primary;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(68,23,230,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              <Camera size={20} color={colors.primary} />
              Sacar foto
            </button>
          </div>

          <FieldError message={uploadError} />

          {/* Info text */}
          <p style={{ textAlign: "center", color: "#9a9aa0", fontSize: 13, lineHeight: 1.6, margin: "8px 0 0" }}>
            Podés agregar o cambiar tu foto en cualquier momento desde tu perfil
          </p>

          {/* Continue and Skip buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
            <button
              onClick={handleContinue}
              disabled={Boolean(uploadError)}
              data-testid="register-continue"
              style={{
                width: "100%",
                background: colors.primary,
                border: "none",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700,
                color: "white",
                transition: "all 0.18s ease",
                boxShadow: colors.buttonShadow,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = colors.primaryDark;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = colors.buttonHoverShadow;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = colors.primary;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = colors.buttonShadow;
              }}
            >
              Continuar
            </button>

            <button
              onClick={handleContinue}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                padding: "12px 18px",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                color: "#9a9aa0",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = colors.primary;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#9a9aa0";
              }}
            >
              Omitir por ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
