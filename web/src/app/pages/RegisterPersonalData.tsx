import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, Check, Upload, Camera } from "lucide-react";
import { useRegister } from "../../context/RegisterContext";
import React from "react";

export default function RegisterPersonalData() {
  const { data, updateData } = useRegister();
  const isAgent = data.role === "AGENT";
  const navigate = useNavigate();
  const [dniFront, setDniFront] = useState<File | null>(null);
  const [dniBack, setDniBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);


  const colors = {
    gradient: isAgent
      ? "linear-gradient(160deg, #FF8C5B 0%, #C52E3E 55%, #A82534 100%)"
      : "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
    primary: isAgent ? "#C52E3E" : "#4417E6",
    primaryDark: isAgent ? "#A82534" : "#3510B8",
    focusShadow: isAgent ? "0 0 0 3px rgba(197,46,62,0.08)" : "0 0 0 3px rgba(68,23,230,0.08)",
    buttonShadow: isAgent ? "0 4px 16px rgba(197,46,62,0.24)" : "0 4px 16px rgba(68,23,230,0.24)",
    buttonHoverShadow: isAgent ? "0 6px 20px rgba(197,46,62,0.32)" : "0 6px 20px rgba(68,23,230,0.32)",
  };

  const dniFrontRef = useRef<HTMLInputElement>(null);
  const dniBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar envío de datos
    console.log(
      "Datos personales:",
      data,
      isAgent
        ? {
            dniFront,
            dniBack,
            selfie,
          }
        : {}
    );
    navigate("/registro/security");
  };

  const isDniValid = data.dni.length === 8;
  const isCuitCuilValid = data.cuitCuil.length === 11;

  const basePersonalValid =
    isDniValid &&
    data.birthDate &&
    data.nationality &&
    isCuitCuilValid &&
    data.location;

  const isFormValid =
    isAgent
      ? basePersonalValid &&
        dniFront &&
        dniBack &&
        selfie
      : basePersonalValid;

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

        {/* Nav row */}
        <div style={{ width: "100%", maxWidth: 420, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "white",
              padding: "8px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            <ArrowLeft size={15} color="white" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Volver</span>
          </button>

          <PropieLogo size={38} />

          {/* spacer */}
          <div style={{ width: 80 }} />
        </div>

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
            Datos personales
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Completá tu información para verificar tu identidad
          </p>
        </div>

        {/* Wave */}
        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}>
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
        </div>
      </div>

      {/* ── FORM ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* DNI */}
            <div>
              <label htmlFor="dni" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                DNI
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="dni"
                  type="text"
                  value={data.dni}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                    updateData({ ...data, dni: value });
                  }}
                  placeholder="12345678"
                  style={{
                    width: "100%",
                    padding: "14px 48px 14px 16px",
                    borderRadius: 14,
                    border: isDniValid ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                    fontSize: 15,
                    color: "#1a1a1a",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    if (!isDniValid) {
                      (e.target as HTMLInputElement).style.borderColor = colors.primary;
                      (e.target as HTMLInputElement).style.boxShadow = colors.focusShadow;
                    }
                  }}
                  onBlur={(e) => {
                    if (!isDniValid) {
                      (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
                {isDniValid && (
                  <div
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={18} color="#34C759" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>

            {/* Birth Date & Nationality */}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="birthDate" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                  Fecha de nacimiento
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="birthDate"
                    type="date"
                    value={data.birthDate}
                    onChange={(e) => updateData({ ...data, birthDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "14px 48px 14px 16px",
                      borderRadius: 14,
                      border: data.birthDate ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                      fontSize: 15,
                      color: "#1a1a1a",
                      outline: "none",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      if (!data.birthDate) {
                        (e.target as HTMLInputElement).style.borderColor = colors.primary;
                        (e.target as HTMLInputElement).style.boxShadow = colors.focusShadow;
                      }
                    }}
                    onBlur={(e) => {
                      if (!data.birthDate) {
                        (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                        (e.target as HTMLInputElement).style.boxShadow = "none";
                      }
                    }}
                  />
                  {data.birthDate && (
                    <div
                      style={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={18} color="#34C759" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="nationality" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                  Nacionalidad
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="nationality"
                    type="text"
                    value={data.nationality}
                    onChange={(e) => updateData({ ...data, nationality: e.target.value })}
                    placeholder="Argentina"
                    style={{
                      width: "100%",
                      padding: "14px 48px 14px 16px",
                      borderRadius: 14,
                      border: data.nationality ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                      fontSize: 15,
                      color: "#1a1a1a",
                      outline: "none",
                      transition: "all 0.15s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      if (!data.nationality) {
                        (e.target as HTMLInputElement).style.borderColor = colors.primary;
                        (e.target as HTMLInputElement).style.boxShadow = colors.focusShadow;
                      }
                    }}
                    onBlur={(e) => {
                      if (!data.nationality) {
                        (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                        (e.target as HTMLInputElement).style.boxShadow = "none";
                      }
                    }}
                  />
                  {data.nationality && (
                    <div
                      style={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={18} color="#34C759" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CUIT/CUIL */}
            <div>
              <label htmlFor="cuitCuil" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                CUIT/CUIL
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="cuitCuil"
                  type="text"
                  value={data.cuitCuil}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                    updateData({ ...data, cuitCuil: value });
                  }}
                  placeholder="20123456789"
                  style={{
                    width: "100%",
                    padding: "14px 48px 14px 16px",
                    borderRadius: 14,
                    border: isCuitCuilValid ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                    fontSize: 15,
                    color: "#1a1a1a",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    if (!isCuitCuilValid) {
                      (e.target as HTMLInputElement).style.borderColor = colors.primary;
                      (e.target as HTMLInputElement).style.boxShadow = colors.focusShadow;
                    }
                  }}
                  onBlur={(e) => {
                    if (!isCuitCuilValid) {
                      (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
                {isCuitCuilValid && (
                  <div
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={18} color="#34C759" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>

            {/* Localización real */}
            <div>
              <label htmlFor="location" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                Localización real
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="location"
                  type="text"
                  value={data.location}
                  onChange={(e) =>
                    updateData({
                      location: e.target.value,
                      address: e.target.value,
                    })
                  }
                  placeholder="Calle 123, Ciudad, Provincia"
                  style={{
                    width: "100%",
                    padding: "14px 48px 14px 16px",
                    borderRadius: 14,
                    border: data.location ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                    fontSize: 15,
                    color: "#1a1a1a",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    if (!data.location) {
                      (e.target as HTMLInputElement).style.borderColor = colors.primary;
                      (e.target as HTMLInputElement).style.boxShadow = colors.focusShadow;
                    }
                  }}
                  onBlur={(e) => {
                    if (!data.location) {
                      (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
                {data.location && (
                  <div
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={18} color="#34C759" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>

            {isAgent && (
              <>
                {/* Section: Validación documental (solo agente) */}
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
                    Validación documental
                  </h3>

                  {/* DNI Front */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                      Frente DNI
                    </label>
                    <input
                      ref={dniFrontRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDniFront(e.target.files[0]);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => dniFrontRef.current?.click()}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 14,
                        border: dniFront ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                        background: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!dniFront) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = colors.primary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!dniFront) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                        }
                      }}
                    >
                      <span style={{ fontSize: 15, color: dniFront ? "#1a1a1a" : "#9a9aa0" }}>
                        {dniFront ? dniFront.name : "Seleccionar archivo"}
                      </span>
                      {dniFront ? (
                        <Check size={20} color="#34C759" strokeWidth={2.5} />
                      ) : (
                        <Upload size={20} color="#9a9aa0" />
                      )}
                    </button>
                  </div>

                  {/* DNI Back */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                      Dorso DNI
                    </label>
                    <input
                      ref={dniBackRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDniBack(e.target.files[0]);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => dniBackRef.current?.click()}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 14,
                        border: dniBack ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                        background: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!dniBack) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = colors.primary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!dniBack) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                        }
                      }}
                    >
                      <span style={{ fontSize: 15, color: dniBack ? "#1a1a1a" : "#9a9aa0" }}>
                        {dniBack ? dniBack.name : "Seleccionar archivo"}
                      </span>
                      {dniBack ? (
                        <Check size={20} color="#34C759" strokeWidth={2.5} />
                      ) : (
                        <Upload size={20} color="#9a9aa0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Section: Validación biométrica (solo agente) */}
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
                    Validación biométrica
                  </h3>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
                      Selfie facial
                    </label>
                    <input
                      ref={selfieRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelfie(e.target.files[0]);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => selfieRef.current?.click()}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 14,
                        border: selfie ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                        background: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!selfie) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = colors.primary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selfie) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                        }
                      }}
                    >
                      <span style={{ fontSize: 15, color: selfie ? "#1a1a1a" : "#9a9aa0" }}>
                        {selfie ? selfie.name : "Tomar selfie"}
                      </span>
                      {selfie ? (
                        <Check size={20} color="#34C759" strokeWidth={2.5} />
                      ) : (
                        <Camera size={20} color="#9a9aa0" />
                      )}
                    </button>
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9a9aa0", lineHeight: 1.5 }}>
                      Usaremos la cámara frontal para verificar tu identidad
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                width: "100%",
                background: isFormValid ? colors.primary : "#e5e5ea",
                border: "none",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: isFormValid ? "pointer" : "not-allowed",
                fontSize: 16,
                fontWeight: 700,
                color: isFormValid ? "white" : "#9a9aa0",
                transition: "all 0.18s ease",
                marginTop: 16,
                boxShadow: isFormValid ? colors.buttonShadow : "none",
              }}
              onMouseEnter={(e) => {
                if (isFormValid) {
                  (e.currentTarget as HTMLButtonElement).style.background = colors.primaryDark;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = colors.buttonHoverShadow;
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid) {
                  (e.currentTarget as HTMLButtonElement).style.background = colors.primary;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = colors.buttonShadow;
                }
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
