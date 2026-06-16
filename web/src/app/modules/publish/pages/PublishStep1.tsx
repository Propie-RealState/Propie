import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PublishWizardCTA } from "../components/PublishWizardCTA";
import { PublishWizardLayout } from "../components/PublishWizardLayout";
import { usePropertyPublish } from "../context/PropertyPublishContext";
import React from "react";
import { updatePropertyBasic } from "../services/updatePropertyBasic";
import { PropertyType } from "../types/property-publish.types";
import { createProperty } from "../services/create-property";
import type { ListingType } from "../types/property-publish.types";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { PublishLocationPicker } from "../components/PublishLocationPicker";
import { updatePropertyLocation } from "../services/update-property-location";
type OperationType = "venta" | "alquiler" | "temporario" | null;

export default function PublishStep1() {
  const theme = useAppTheme();
  const navigate = useNavigate();

  const { data, updateData, startCreatePublish } = usePropertyPublish();

  useEffect(() => {
    if (data.publishMode === null) {
      startCreatePublish();
    }
  }, []);

  const [operationType, setOperationType] = useState<OperationType>(null);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (data.listingType) {
      const reverseListingTypeMap: Record<ListingType, OperationType> = {
        SALE: "venta",
        RENT: "alquiler",
        TEMPORARY: "temporario",
      };

      setOperationType(reverseListingTypeMap[data.listingType]);
    }

  }, []);

  const locationValue = {
    country:
      data.country,
    province:
      data.province,
    city:
      data.city,
    neighborhood:
      data.neighborhood,
    address:
      data.address,
    lat:
      data.lat,
    lng:
      data.lng,
  };

  const persistLocationForProperty =
    async (propertyId: string) => {
      if (
        !data.address ||
        data.lat === null ||
        data.lng === null
      ) {
        return;
      }

      await updatePropertyLocation(
        propertyId,
        {
          country:
            data.country || "Argentina",
          province:
            data.province || "Cordoba",
          city:
            data.city || "Cordoba",
          neighborhood:
            data.neighborhood || "Centro",
          address:
            data.address,
          lat:
            data.lat,
          lng:
            data.lng,
        }
      );
    };

  const handleContinue = async () => {
    const listingTypeMap = {
      venta: "SALE",
      alquiler: "RENT",
      temporario: "TEMPORARY",
    } as const;

    if (!data.propertyType || !operationType) {
      return;
    }

    try {
      const mappedListingType = listingTypeMap[operationType];

      const basicPayload = {
        title: data.title ?? "",
        description: data.description ?? "",
        price: Number(data.price ?? 0),
        currency: data.currency ?? "USD",
        bedrooms: Number(data.bedrooms ?? 0),
        bathrooms: Number(data.bathrooms ?? 0),
        areaM2: Number(data.areaM2 ?? 0),
        propertyType: data.propertyType,
        operationType: mappedListingType,
      };

      const contextUpdate = {
        propertyType: data.propertyType,
        listingType: mappedListingType,
      };

      const isEditMode =
        data.publishMode === "edit" && Boolean(data.propertyId);

      if (isEditMode) {
        await updatePropertyBasic(data.propertyId!, basicPayload);
        await persistLocationForProperty(data.propertyId!);
        updateData(contextUpdate);
        navigate("/publicar/fotos-videos");
        return;
      }

      if (data.propertyId) {
        await updatePropertyBasic(data.propertyId, basicPayload);
        await persistLocationForProperty(data.propertyId);
        updateData(contextUpdate);
        navigate("/publicar/fotos-videos");
        return;
      }

      const result = await createProperty({
        propertyType: data.propertyType,
        listingType: mappedListingType,
      });

      updateData({
        ...contextUpdate,
        propertyId: result.propertyId,
        publishMode: "create",
      });

      await persistLocationForProperty(
        result.propertyId
      );

      navigate("/publicar/fotos-videos");
    } catch (error) {
      console.error("Create property failed", error);
    }
  };

  const isFormValid =
    operationType &&
    data.propertyType &&
    data.address &&
    data.lat !== null &&
    data.lng !== null;

  const continueHint =
    showValidation && !isFormValid
      ? "Seleccioná el tipo de operación, tipo de propiedad y una dirección en el mapa."
      : undefined;

  const handleContinueAttempt = () => {
    if (!isFormValid) {
      setShowValidation(true);
      return;
    }

    void handleContinue();
  };

  const operationCards = [
    {
      id: "venta" as OperationType,
      label: "Venta",
      emoji: "💰",
      desc: "Vendé tu propiedad",
    },
    {
      id: "alquiler" as OperationType,
      label: "Alquiler",
      emoji: "🏘️",
      desc: "Alquilá largo plazo",
    },
    {
      id: "temporario" as OperationType,
      label: "Temporario",
      emoji: "🌴",
      desc: "Alquiler temporario",
    },
  ];

  const propertyCards = [
    {
      id: "HOUSE" as PropertyType,
      label: "Casa",
      emoji: "🏠",
    },
    {
      id: "APARTMENT" as PropertyType,
      label: "Departamento",
      emoji: "🏢",
    },
    {
      id: "LAND" as PropertyType,
      label: "Terreno",
      emoji: "🌳",
    },
    {
      id: "COMMERCIAL" as PropertyType,
      label: "Local",
      emoji: "🏪",
    },
    {
      id: "OFFICE" as PropertyType,
      label: "Oficina",
      emoji: "💼",
    },
  ];

  return (
    <PublishWizardLayout
      title="Publicá tu propiedad"
      subtitle="Comenzá completando los datos básicos"
      footer={
        <PublishWizardCTA
          label="Continuar"
          onClick={handleContinueAttempt}
          hint={continueHint}
        />
      }
    >
          {/* Tipo de operación */}
          <div>
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Tipo de operación
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {operationCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setOperationType(card.id)}
                  style={{
                    width: "100%",
                    background: "white",
                    border:
                      operationType === card.id
                        ? `2px solid ${theme.primary}`
                        : "2px solid transparent",
                    borderRadius: 16,
                    padding: "18px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    transition: "all 0.15s ease",
                    boxShadow:
                      operationType === card.id
                        ? "0 4px 16px rgba(197,46,62,0.15)"
                        : "0 1px 6px rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    if (operationType !== card.id) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#e5e5ea";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (operationType !== card.id) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "transparent";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 1px 6px rgba(0,0,0,0.06)";
                    }
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background:
                        operationType === card.id
                          ? "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)"
                          : "#f8f8f8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {card.emoji}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1a1a1a",
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {card.label}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}
                    >
                      {card.desc}
                    </div>
                  </div>
                  {operationType === card.id && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: theme.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "white",
                        }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de propiedad */}
          <div>
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Tipo de propiedad
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
              }}
            >
              {propertyCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() =>
                    updateData({
                      propertyType: card.id as PropertyType,
                    })
                  }
                  style={{
                    background: "white",
                    border:
                      data.propertyType === card.id
                        ? `2px solid ${theme.primary}`
                        : "2px solid transparent",
                    borderRadius: 16,
                    padding: "20px 16px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    transition: "all 0.15s ease",
                    boxShadow:
                      data.propertyType === card.id
                        ? "0 4px 16px rgba(197,46,62,0.15)"
                        : "0 1px 6px rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    if (data.propertyType !== card.id) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#e5e5ea";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (data.propertyType !== card.id) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "transparent";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 1px 6px rgba(0,0,0,0.06)";
                    }
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background:
                        data.propertyType === card.id
                          ? "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)"
                          : "#f8f8f8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                    }}
                  >
                    {card.emoji}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1a1a1a",
                      textAlign: "center",
                    }}
                  >
                    {card.label}
                  </div>
                  {data.propertyType === card.id && (
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: theme.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: -4,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "white",
                        }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Dirección
            </h3>
            <PublishLocationPicker
              value={locationValue}
              onChange={(nextLocation) => updateData(nextLocation)}
            />
          </div>
    </PublishWizardLayout>
  );
}
