import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, CheckCircle2, Upload, MapPin, DollarSign, Image as ImageIcon, AlertCircle } from "lucide-react";
import React from "react";

export default function PublishStep5() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState({
    autorizado: false,
    terminos: false,
    identidad: true, // Auto-checked because user completed registration
  });
  const [escritura, setEscritura] = useState<File | null>(null);
  const [autorizacion, setAutorizacion] = useState<File | null>(null);

  const handleCheckboxChange = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileUpload = (type: "escritura" | "autorizacion", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "escritura") setEscritura(file);
      else setAutorizacion(file);
    }
  };

  const handlePublish = () => {
    // TODO: Submit property data to backend
    console.log("Publicando propiedad...");
    // Navigate to success page or explore
    navigate("/explorar");
  };

  const isFormValid = checklist.autorizado && checklist.terminos && checklist.identidad;

  // Mock data for preview
  const mockProperty = {
    photos: 8,
    price: "USD 285,000",
    address: "Av. Corrientes 1234, CABA",
    description: "Hermoso departamento de 2 ambientes con vista...",
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
          background: "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
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
            Verificación y publicar
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Últimos pasos antes de publicar tu propiedad
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
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Checklist */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
              Verificación
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Item 1 */}
              <label
                style={{
                  background: "white",
                  border: "2px solid transparent",
                  borderRadius: 16,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                }}
              >
                <input
                  type="checkbox"
                  checked={checklist.autorizado}
                  onChange={() => handleCheckboxChange("autorizado")}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    border: checklist.autorizado ? "2px solid #4417E6" : "2px solid #d1d1d6",
                    background: checklist.autorizado ? "#4417E6" : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {checklist.autorizado && <CheckCircle2 size={16} color="white" />}
                </div>
                <div style={{ flex: 1, fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>
                  Soy titular o estoy autorizado a publicar esta propiedad
                </div>
              </label>

              {/* Item 2 */}
              <label
                style={{
                  background: "white",
                  border: "2px solid transparent",
                  borderRadius: 16,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                }}
              >
                <input
                  type="checkbox"
                  checked={checklist.terminos}
                  onChange={() => handleCheckboxChange("terminos")}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    border: checklist.terminos ? "2px solid #4417E6" : "2px solid #d1d1d6",
                    background: checklist.terminos ? "#4417E6" : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {checklist.terminos && <CheckCircle2 size={16} color="white" />}
                </div>
                <div style={{ flex: 1, fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>
                  Acepto los términos y condiciones de publicación
                </div>
              </label>

              {/* Item 3 - Auto-checked */}
              <div
                style={{
                  background: "white",
                  border: "2px solid transparent",
                  borderRadius: 16,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                  opacity: 0.7,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={16} color="white" />
                </div>
                <div style={{ flex: 1, fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>
                  Identidad validada
                </div>
              </div>
            </div>
          </div>

          {/* Optional uploads */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
              Documentos opcionales
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Escritura */}
              <label
                style={{
                  background: "white",
                  border: "2px dashed #d1d1d6",
                  borderRadius: 16,
                  padding: "18px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => handleFileUpload("escritura", e)}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: escritura ? "#f0eeff" : "#f8f8f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {escritura ? <CheckCircle2 size={20} color="#4417E6" /> : <Upload size={20} color="#9a9aa0" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                    {escritura ? escritura.name : "Escritura"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    {escritura ? "Documento cargado" : "PDF, JPG o PNG"}
                  </div>
                </div>
              </label>

              {/* Autorización */}
              <label
                style={{
                  background: "white",
                  border: "2px dashed #d1d1d6",
                  borderRadius: 16,
                  padding: "18px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => handleFileUpload("autorizacion", e)}
                  style={{ display: "none" }}
                />
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: autorizacion ? "#f0eeff" : "#f8f8f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {autorizacion ? <CheckCircle2 size={20} color="#4417E6" /> : <Upload size={20} color="#9a9aa0" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                    {autorizacion ? autorizacion.name : "Autorización"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    {autorizacion ? "Documento cargado" : "PDF, JPG o PNG"}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
              Vista previa
            </h3>
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: "18px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Photos */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ImageIcon size={20} color="#4417E6" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                    {mockProperty.photos} fotos cargadas
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    Imágenes y videos
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#f0f0f0" }} />

              {/* Price */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <DollarSign size={20} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                    {mockProperty.price}
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    Precio de venta
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#f0f0f0" }} />

              {/* Location */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={20} color="#ca8a04" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                    {mockProperty.address}
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    Ubicación
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#f0f0f0" }} />

              {/* Description */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>
                  Descripción
                </div>
                <div style={{ fontSize: 13, color: "#6e6e73", lineHeight: 1.6 }}>
                  {mockProperty.description}
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          {!isFormValid && (
            <div
              style={{
                background: "#fff7ed",
                border: "1.5px solid #fed7aa",
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <AlertCircle size={18} color="#ea580c" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 13, color: "#9a3412", lineHeight: 1.5 }}>
                Completá todas las verificaciones requeridas para continuar
              </div>
            </div>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={!isFormValid}
            style={{
              width: "100%",
              background: isFormValid ? "#4417E6" : "#e5e5ea",
              border: "none",
              borderRadius: 16,
              padding: "16px 18px",
              cursor: isFormValid ? "pointer" : "not-allowed",
              fontSize: 16,
              fontWeight: 700,
              color: isFormValid ? "white" : "#9a9aa0",
              transition: "all 0.18s ease",
              marginTop: 8,
              boxShadow: isFormValid ? "0 4px 16px rgba(68,23,230,0.24)" : "none",
            }}
            onMouseEnter={(e) => {
              if (isFormValid) {
                (e.currentTarget as HTMLButtonElement).style.background = "#3510B8";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(68,23,230,0.32)";
              }
            }}
            onMouseLeave={(e) => {
              if (isFormValid) {
                (e.currentTarget as HTMLButtonElement).style.background = "#4417E6";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(68,23,230,0.24)";
              }
            }}
          >
            Publicar propiedad
          </button>
        </div>
      </div>
    </div>
  );
}
