import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, Check } from "lucide-react";
import React from "react";

type AmenityType = "pileta" | "patio" | "balcon" | "mascotas" | "seguridad";

export default function PublishStep3() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    rooms: "",
    bathrooms: "",
    sqm: "",
    garage: "",
  });
  const [amenities, setAmenities] = useState<AmenityType[]>([]);

  const handleContinue = () => {
    console.log("Información:", { ...formData, amenities });
    navigate("/publicar/comercializacion");
  };

  const toggleAmenity = (amenity: AmenityType) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const isFormValid =
    formData.title &&
    formData.description &&
    formData.price &&
    formData.rooms &&
    formData.bathrooms &&
    formData.sqm;

  const amenitiesList = [
    { id: "pileta" as AmenityType, label: "Pileta", emoji: "🏊" },
    { id: "patio" as AmenityType, label: "Patio", emoji: "🌿" },
    { id: "balcon" as AmenityType, label: "Balcón", emoji: "🪟" },
    { id: "mascotas" as AmenityType, label: "Mascotas", emoji: "🐕" },
    { id: "seguridad" as AmenityType, label: "Seguridad", emoji: "🔒" },
  ];

  const maxCharsDesc = 500;
  const descChars = formData.description.length;

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
            Información
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Agregá los detalles de tu propiedad
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
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title */}
          <div>
            <label htmlFor="title" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
              Título
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Departamento luminoso en Palermo"
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  borderRadius: 14,
                  border: formData.title ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                  fontSize: 15,
                  color: "#1a1a1a",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  if (!formData.title) {
                    (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                    (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                  }
                }}
                onBlur={(e) => {
                  if (!formData.title) {
                    (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }
                }}
              />
              {formData.title && (
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

          {/* Description */}
          <div>
            <label htmlFor="description" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
              Descripción
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  if (e.target.value.length <= maxCharsDesc) {
                    setFormData({ ...formData, description: e.target.value });
                  }
                }}
                placeholder="Describí las características principales de tu propiedad..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: formData.description ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                  fontSize: 15,
                  color: "#1a1a1a",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                  resize: "none",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.6,
                }}
                onFocus={(e) => {
                  if (!formData.description) {
                    (e.target as HTMLTextAreaElement).style.borderColor = "#4417E6";
                    (e.target as HTMLTextAreaElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                  }
                }}
                onBlur={(e) => {
                  if (!formData.description) {
                    (e.target as HTMLTextAreaElement).style.borderColor = "#e5e5ea";
                    (e.target as HTMLTextAreaElement).style.boxShadow = "none";
                  }
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 16,
                  fontSize: 12,
                  color: descChars > maxCharsDesc * 0.9 ? "#C52E3E" : "#9a9aa0",
                  fontWeight: 500,
                }}
              >
                {descChars}/{maxCharsDesc}
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
              Precio
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 15,
                  color: "#6e6e73",
                  fontWeight: 600,
                }}
              >
                USD
              </div>
              <input
                id="price"
                type="text"
                value={formData.price}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, price: value });
                }}
                placeholder="0"
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 56px",
                  borderRadius: 14,
                  border: formData.price ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                  fontSize: 15,
                  color: "#1a1a1a",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  if (!formData.price) {
                    (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                    (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                  }
                }}
                onBlur={(e) => {
                  if (!formData.price) {
                    (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                    (e.target as HTMLInputElement).style.boxShadow = "none";
                  }
                }}
              />
              {formData.price && (
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

          {/* Quick data */}
          <div>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
              Datos rápidos
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {/* Rooms */}
              <div>
                <label htmlFor="rooms" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6e6e73", marginBottom: 6 }}>
                  Habitaciones
                </label>
                <input
                  id="rooms"
                  type="text"
                  inputMode="numeric"
                  value={formData.rooms}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, rooms: value });
                  }}
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: formData.rooms ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                    fontSize: 15,
                    color: "#1a1a1a",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                  onFocus={(e) => {
                    if (!formData.rooms) {
                      (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                      (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!formData.rooms) {
                      (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label htmlFor="bathrooms" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6e6e73", marginBottom: 6 }}>
                  Baños
                </label>
                <input
                  id="bathrooms"
                  type="text"
                  inputMode="numeric"
                  value={formData.bathrooms}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, bathrooms: value });
                  }}
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: formData.bathrooms ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                    fontSize: 15,
                    color: "#1a1a1a",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                  onFocus={(e) => {
                    if (!formData.bathrooms) {
                      (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                      (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!formData.bathrooms) {
                      (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
              </div>

              {/* Square meters */}
              <div>
                <label htmlFor="sqm" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6e6e73", marginBottom: 6 }}>
                  m²
                </label>
                <input
                  id="sqm"
                  type="text"
                  inputMode="numeric"
                  value={formData.sqm}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, sqm: value });
                  }}
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: formData.sqm ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                    fontSize: 15,
                    color: "#1a1a1a",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                  onFocus={(e) => {
                    if (!formData.sqm) {
                      (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                      (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!formData.sqm) {
                      (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
              </div>

              {/* Garage */}
              <div>
                <label htmlFor="garage" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6e6e73", marginBottom: 6 }}>
                  Cochera
                </label>
                <input
                  id="garage"
                  type="text"
                  inputMode="numeric"
                  value={formData.garage}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, garage: value });
                  }}
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: formData.garage ? "1.5px solid #34C759" : "1.5px solid #e5e5ea",
                    fontSize: 15,
                    color: "#1a1a1a",
                    outline: "none",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                  onFocus={(e) => {
                    if (!formData.garage) {
                      (e.target as HTMLInputElement).style.borderColor = "#4417E6";
                      (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(68,23,230,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!formData.garage) {
                      (e.target as HTMLInputElement).style.borderColor = "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
              Amenities
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  style={{
                    background: amenities.includes(amenity.id) ? "#4417E6" : "white",
                    border: amenities.includes(amenity.id) ? "2px solid #4417E6" : "2px solid #e5e5ea",
                    borderRadius: 12,
                    padding: "10px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.15s ease",
                    boxShadow: amenities.includes(amenity.id) ? "0 4px 12px rgba(68,23,230,0.2)" : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    if (!amenities.includes(amenity.id)) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#4417E6";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(68,23,230,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!amenities.includes(amenity.id)) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                    }
                  }}
                >
                  <span style={{ fontSize: 18 }}>{amenity.emoji}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: amenities.includes(amenity.id) ? "white" : "#1a1a1a",
                    }}
                  >
                    {amenity.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
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
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
