import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PublishWizardCTA } from "../components/PublishWizardCTA";
import { PublishWizardLayout } from "../components/PublishWizardLayout";
import { Check } from "lucide-react";
import React from "react";
import { updatePropertyAmenities } from "../services/update-property-amenities.ts";
import { usePropertyPublish } from "../context/PropertyPublishContext";
import { updatePropertyBasic } from "../services/updatePropertyBasic";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { amenitiesMap } from "../mappers/map-amenities-to-api";
import type { PropertyCurrency } from "../types/property-publish.types";
  
type AmenityType = "pileta" | "patio" | "balcon" | "mascotas" | "seguridad";

export default function PublishStep3() {
  const theme = useAppTheme();
  const { data, updateData } = usePropertyPublish();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "USD" as PropertyCurrency,
    rooms: "",
    bathrooms: "",
    sqm: "",
    garage: "",
  });
  const [amenities, setAmenities] = useState<AmenityType[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (!data.title && !data.description) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      title: data.title || "",
      description: data.description || "",
      price: data.price?.toString() || "",
      currency: data.currency || "USD",
      rooms: data.bedrooms?.toString() || "",
      bathrooms: data.bathrooms?.toString() || "",
      sqm: data.areaM2?.toString() || "",
    }));
  }, [
    data.title,
    data.description,
    data.price,
    data.currency,
    data.bedrooms,
    data.bathrooms,
    data.areaM2,
  ]);

  useEffect(() => {
    if (!data.amenities?.length) {
      return;
    }

    const mappedAmenities = data.amenities
      .map((amenity) => {
        switch (amenity) {
          case "POOL":
            return "pileta";

          case "PATIO":
            return "patio";

          case "BALCONY":
            return "balcon";

          case "PETS":
            return "mascotas";

          case "SECURITY":
            return "seguridad";

          default:
            return null;
        }
      })
      .filter(Boolean) as AmenityType[];

    setAmenities(mappedAmenities);
  }, [data.amenities]);

  const handleContinue = async () => {
    console.log("HANDLE CONTINUE");

    console.log("PROPERTY ID", data.propertyId);

    console.log("FORM DATA", formData);

    if (!data.propertyId) {
      console.log("NO PROPERTY ID");

      return;
    }

    try {
      await updatePropertyBasic(data.propertyId, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        currency: formData.currency,
        bedrooms: Number(formData.rooms),
        bathrooms: Number(formData.bathrooms),
        areaM2: Number(formData.sqm),
        propertyType: data.propertyType ?? "HOUSE",
        operationType: data.listingType ?? "SALE",
      });

      await updatePropertyAmenities(
        data.propertyId,
        amenities.map((amenity) => amenitiesMap[amenity]),
      );

      updateData({
        title: formData.title,

        description: formData.description,

        price: Number(formData.price),

        currency: formData.currency,

        bedrooms: Number(formData.rooms),

        bathrooms: Number(formData.bathrooms),

        areaM2: Number(formData.sqm),

        amenities,
      });

      navigate("/publicar/comercializacion");
    } catch (error) {
      console.error("Update property details failed", error);
    }
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

  const continueHint =
    showValidation && !isFormValid
      ? "Completá título, descripción, precio, habitaciones, baños y m²."
      : undefined;

  const handleContinueAttempt = () => {
    if (!isFormValid) {
      setShowValidation(true);
      return;
    }

    void handleContinue();
  };

  return (
    <PublishWizardLayout
      title="Información"
      subtitle="Agregá los detalles de tu propiedad"
      footer={
        <PublishWizardCTA
          label="Continuar"
          onClick={handleContinueAttempt}
          hint={continueHint}
        />
      }
    >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#1a1a1a",
                marginBottom: 8,
              }}
            >
              Título
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Departamento luminoso en Palermo"
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  borderRadius: 14,
                  border: formData.title
                    ? "1.5px solid #34C759"
                    : "1.5px solid #e5e5ea",
                  fontSize: 15,
                  color: "#1a1a1a",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  if (!formData.title) {
                    (e.target as HTMLInputElement).style.borderColor =
                      theme.primary;
                    (e.target as HTMLInputElement).style.boxShadow =
                      "0 0 0 3px rgba(197,46,62,0.08)";
                  }
                }}
                onBlur={(e) => {
                  if (!formData.title) {
                    (e.target as HTMLInputElement).style.borderColor =
                      "#e5e5ea";
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
            <label
              htmlFor="description"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#1a1a1a",
                marginBottom: 8,
              }}
            >
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
                  border: formData.description
                    ? "1.5px solid #34C759"
                    : "1.5px solid #e5e5ea",
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
                    (e.target as HTMLTextAreaElement).style.borderColor =
                      theme.primary;
                    (e.target as HTMLTextAreaElement).style.boxShadow =
                      "0 0 0 3px rgba(197,46,62,0.08)";
                  }
                }}
                onBlur={(e) => {
                  if (!formData.description) {
                    (e.target as HTMLTextAreaElement).style.borderColor =
                      "#e5e5ea";
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
            <label
              htmlFor="price"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#1a1a1a",
                marginBottom: 8,
              }}
            >
              Precio
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                borderRadius: 14,
                border: formData.price
                  ? "1.5px solid #34C759"
                  : "1.5px solid #e5e5ea",
                overflow: "hidden",
                background: "white",
                transition: "all 0.15s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              }}
            >
              <div
                role="group"
                aria-label="Moneda"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 6,
                  borderRight: "1.5px solid #e5e5ea",
                  background:
                    "linear-gradient(180deg, #fafafa 0%, #f3f3f5 100%)",
                }}
              >
                {(["USD", "ARS"] as PropertyCurrency[]).map((currency) => {
                  const isActive = formData.currency === currency;

                  return (
                    <button
                      key={currency}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          currency,
                        })
                      }
                      style={{
                        border: isActive
                          ? `1.5px solid ${theme.primary}`
                          : "1.5px solid transparent",
                        borderRadius: 10,
                        padding: "8px 11px",
                        minWidth: 52,
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: 0.2,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        background: isActive ? theme.primary : "white",
                        color: isActive ? "white" : "#6e6e73",
                        boxShadow: isActive
                          ? "0 2px 8px rgba(197,46,62,0.18)"
                          : "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        if (isActive) return;
                        (e.currentTarget as HTMLButtonElement).style.color =
                          theme.primary;
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          "rgba(197,46,62,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        if (isActive) return;
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "#6e6e73";
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          "transparent";
                      }}
                    >
                      {currency}
                    </button>
                  );
                })}
              </div>
              <div style={{ position: "relative", flex: 1 }}>
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
                  padding: "14px 48px 14px 16px",
                  border: "none",
                  fontSize: 15,
                  color: "#1a1a1a",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "transparent",
                }}
                onFocus={(e) => {
                  const container = (e.target as HTMLInputElement).parentElement
                    ?.parentElement as HTMLDivElement | null;
                  if (!formData.price && container) {
                    container.style.borderColor = theme.primary;
                    container.style.boxShadow =
                      "0 0 0 3px rgba(197,46,62,0.08)";
                  }
                }}
                onBlur={(e) => {
                  const container = (e.target as HTMLInputElement).parentElement
                    ?.parentElement as HTMLDivElement | null;
                  if (!formData.price && container) {
                    container.style.borderColor = "#e5e5ea";
                    container.style.boxShadow = "none";
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
          </div>

          {/* Quick data */}
          <div>
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Datos rápidos
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
              }}
            >
              {/* Rooms */}
              <div>
                <label
                  htmlFor="rooms"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6e6e73",
                    marginBottom: 6,
                  }}
                >
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
                    border: formData.rooms
                      ? "1.5px solid #34C759"
                      : "1.5px solid #e5e5ea",
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
                      (e.target as HTMLInputElement).style.borderColor =
                        theme.primary;
                      (e.target as HTMLInputElement).style.boxShadow =
                        "0 0 0 3px rgba(197,46,62,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!formData.rooms) {
                      (e.target as HTMLInputElement).style.borderColor =
                        "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label
                  htmlFor="bathrooms"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6e6e73",
                    marginBottom: 6,
                  }}
                >
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
                    border: formData.bathrooms
                      ? "1.5px solid #34C759"
                      : "1.5px solid #e5e5ea",
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
                      (e.target as HTMLInputElement).style.borderColor =
                        theme.primary;
                      (e.target as HTMLInputElement).style.boxShadow =
                        "0 0 0 3px rgba(197,46,62,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!formData.bathrooms) {
                      (e.target as HTMLInputElement).style.borderColor =
                        "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
              </div>

              {/* Square meters */}
              <div>
                <label
                  htmlFor="sqm"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6e6e73",
                    marginBottom: 6,
                  }}
                >
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
                    border: formData.sqm
                      ? "1.5px solid #34C759"
                      : "1.5px solid #e5e5ea",
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
                      (e.target as HTMLInputElement).style.borderColor =
                        theme.primary;
                      (e.target as HTMLInputElement).style.boxShadow =
                        "0 0 0 3px rgba(197,46,62,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!formData.sqm) {
                      (e.target as HTMLInputElement).style.borderColor =
                        "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
              </div>

              {/* Garage */}
              <div>
                <label
                  htmlFor="garage"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6e6e73",
                    marginBottom: 6,
                  }}
                >
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
                    border: formData.garage
                      ? "1.5px solid #34C759"
                      : "1.5px solid #e5e5ea",
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
                      (e.target as HTMLInputElement).style.borderColor =
                        theme.primary;
                      (e.target as HTMLInputElement).style.boxShadow =
                        "0 0 0 3px rgba(197,46,62,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!formData.garage) {
                      (e.target as HTMLInputElement).style.borderColor =
                        "#e5e5ea";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Amenities
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  style={{
                    background: amenities.includes(amenity.id)
                      ? theme.primary
                      : "white",
                    border: amenities.includes(amenity.id)
                      ? `2px solid ${theme.primary}`
                      : "2px solid #e5e5ea",
                    borderRadius: 12,
                    padding: "10px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.15s ease",
                    boxShadow: amenities.includes(amenity.id)
                      ? "0 4px 12px rgba(197,46,62,0.2)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    if (!amenities.includes(amenity.id)) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        theme.primary;
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 4px 12px rgba(197,46,62,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!amenities.includes(amenity.id)) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#e5e5ea";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 1px 4px rgba(0,0,0,0.04)";
                    }
                  }}
                >
                  <span style={{ fontSize: 18 }}>{amenity.emoji}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: amenities.includes(amenity.id)
                        ? "white"
                        : "#1a1a1a",
                    }}
                  >
                    {amenity.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

    </PublishWizardLayout>
  );
}
