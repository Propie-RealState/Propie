import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublishWizardCTA } from "../components/PublishWizardCTA";
import { PublishWizardLayout } from "../components/PublishWizardLayout";
import { Users, XCircle } from "lucide-react";
import React from "react";
import {
  savePropertyCommercialization,
} from "../services/save-property-commercialization.ts";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { usePropertyPublish } from "../context/PropertyPublishContext";

type CommercializationType = "AGENTS" | "DIRECT";

export default function PublishStep4() {
  const theme = useAppTheme();

  const navigate = useNavigate();
  const {
    data,
    updateData,
  } = usePropertyPublish();

  const [commercializationType, setCommercializationType] =
    useState<CommercializationType | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const isFormValid = Boolean(commercializationType);

  const continueHint =
    showValidation && !isFormValid
      ? "Elegí una opción de comercialización."
      : undefined;

  const handleContinueAttempt = () => {
    if (!isFormValid) {
      setShowValidation(true);
      return;
    }

    void handleContinue();
  };

  const commercializationOptions = [
    {
      id: "AGENTS" as CommercializationType,
      title: "Aceptar agentes",
      desc: "Agentes independientes pueden promocionar tu propiedad",
      icon: (
        <Users size={24} color={theme.primary} strokeWidth={2} />
      ),
    },
    {
      id: "DIRECT" as CommercializationType,
      title: "Sin intermediarios",
      desc: "Gestiono todo directamente sin ayuda externa",
      icon: (
        <XCircle size={24} color={theme.primary} strokeWidth={2} />
      ),
    },
  ];

  const handleContinue = async () => {
    if (!commercializationType || !data.propertyId) {
      return;
    }

    try {
      updateData({ commercializationType });

      await savePropertyCommercialization({
        propertyId: data.propertyId,
        commercializationType,
      });

      navigate("/publicar/revision");
    } catch (error) {
      console.error("Save commercialization failed", error);
    }
  };

  const handleOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const lastIndex = commercializationOptions.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    const nextOption = commercializationOptions[nextIndex];
    setCommercializationType(nextOption.id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [nextIndex]?.focus();
  };

  return (
    <PublishWizardLayout
      title="Comercialización"
      footer={
        <PublishWizardCTA
          label="Continuar"
          onClick={handleContinueAttempt}
          hint={continueHint}
        />
      }
    >
      <div>
        <h3
          id="commercialization-heading"
          style={{
            margin: "0 0 14px",
            fontSize: 16,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Opciones de comercialización
        </h3>
        <div
          role="radiogroup"
          aria-labelledby="commercialization-heading"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {commercializationOptions.map((option, index) => {
            const isSelected = commercializationType === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setCommercializationType(option.id)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                style={{
                  width: "100%",
                  background: "white",
                  border: isSelected
                    ? `2px solid ${theme.primary}`
                    : "2px solid transparent",
                  borderRadius: 16,
                  padding: "18px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.15s ease",
                  boxShadow: isSelected
                    ? "0 4px 16px rgba(197,46,62,0.15)"
                    : "0 1px 6px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#e5e5ea";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
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
                    background: isSelected
                      ? "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)"
                      : "#f8f8f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {option.icon}
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1a1a1a",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {option.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6e6e73",
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {option.desc}
                  </div>
                </div>
                {isSelected && (
                  <div
                    aria-hidden="true"
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
            );
          })}
        </div>
      </div>
    </PublishWizardLayout>
  );
}
