import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, ArrowRight, Eye } from "lucide-react";
import { PropertyType } from "../types/property-publish.types";
import { usePropertyPublish } from "../context/PropertyPublishContext";

const propertyConfig: Record<
  PropertyType,
  { label: string; emoji: string; color: string }
> = {
  HOUSE:      { label: "Casa",            emoji: "🏡", color: "#4417E6" },
  APARTMENT:  { label: "Departamento",    emoji: "🏢", color: "#4417E6" },
  LAND:       { label: "Terreno",         emoji: "🌿", color: "#197A52" },
  COMMERCIAL: { label: "Local comercial", emoji: "🏬", color: "#C52E3E" },
  OFFICE:     { label: "Oficina",         emoji: "🏛️", color: "#4417E6" },
};

interface PublishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PublishSuccessModal({
  isOpen,
  onClose,
}: PublishSuccessModalProps) {
  const navigate = useNavigate();
  const { data, reset } = usePropertyPublish();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const config =
    data.propertyType
      ? propertyConfig[data.propertyType]
      : propertyConfig.HOUSE;

  const handleExplore = () => {
    reset();
    onClose();
    navigate("/explorar");
  };

  const handleViewPublication = () => {
    onClose();
    navigate(`/propiedades/${data.propertyId}`);
  };

  return (
    <>
      <style>{`
        @keyframes ps-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ps-card-in {
          0%   { opacity: 0; transform: scale(0.82) translateY(18px); }
          65%  { opacity: 1; transform: scale(1.03) translateY(-3px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes ps-check-bounce {
          0%   { transform: scale(0);    opacity: 0; }
          55%  { transform: scale(1.25); opacity: 1; }
          75%  { transform: scale(0.9);              }
          100% { transform: scale(1);                }
        }
        @keyframes ps-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes ps-ring-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(255,255,255,0.45); }
          70%  { box-shadow: 0 0 0 14px rgba(255,255,255,0);  }
          100% { box-shadow: 0 0 0 0   rgba(255,255,255,0);   }
        }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          padding: "16px",
          animation: "ps-backdrop-in 0.22s ease both",
        }}
      >
        {/* Card */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 400,
            background: "white",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 28px 70px rgba(0,0,0,0.22)",
            animation: visible
              ? "ps-card-in 0.48s cubic-bezier(0.34,1.56,0.64,1) both"
              : "none",
          }}
        >
          {/* Header gradient */}
          <div
            style={{
              background:
                "linear-gradient(160deg, #5A32F0 0%, #4417E6 55%, #3510B8 100%)",
              padding: "40px 28px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Blobs */}
            <div style={{ position: "absolute", width: 220, height: 220, background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)", top: -70, right: -50, pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 140, height: 140, background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", bottom: -30, left: -30, pointerEvents: "none" }} />

            {/* Animated checkmark */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                border: "2.5px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                animation: visible
                  ? "ps-check-bounce 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.22s both, ps-ring-pulse 1.2s ease 0.6s 2"
                  : "none",
              }}
            >
              <CheckCircle2 size={36} color="white" strokeWidth={1.8} />
            </div>

            <div
              style={{
                animation: visible
                  ? "ps-fade-up 0.35s ease 0.45s both"
                  : "none",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 13,
                  fontWeight: 500,
                  margin: "0 0 7px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Publicación completada
              </p>
              <h2
                style={{
                  color: "white",
                  fontSize: "clamp(22px, 6vw, 27px)",
                  fontWeight: 800,
                  letterSpacing: "-0.8px",
                  lineHeight: 1.15,
                  fontFamily: "'Sora', sans-serif",
                  margin: 0,
                }}
              >
                ¡Tu propiedad ya está online!
              </h2>
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              padding: "24px 24px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              animation: visible
                ? "ps-fade-up 0.38s ease 0.55s both"
                : "none",
            }}
          >
            {/* Property card */}
            <div
              style={{
                background: "#f8f8fb",
                border: "1.5px solid #ebebf0",
                borderRadius: 16,
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `${config.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {config.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9a9aa0",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {config.label}
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {data.title || "Tu propiedad"}
                </p>
                {data.city && (
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6e6e73" }}>
                    📍 {data.city}
                  </p>
                )}
              </div>
            </div>

            {/* Info bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                <Sparkles size={15} color="#4417E6" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#3a3a3a", lineHeight: 1.55 }}>
                  Tu publicación ya puede aparecer en búsquedas y mapas.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                <Sparkles size={15} color="#C52E3E" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#3a3a3a", lineHeight: 1.55 }}>
                  Los agentes Propie ya pueden aplicar para comercializarla.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Primary — Explore */}
              <button
                onClick={handleExplore}
                style={{
                  width: "100%",
                  background: "#4417E6",
                  border: "none",
                  borderRadius: 16,
                  padding: "16px 18px",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(68,23,230,0.28)",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = "#3510B8";
                  b.style.transform = "translateY(-1px)";
                  b.style.boxShadow = "0 6px 20px rgba(68,23,230,0.36)";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = "#4417E6";
                  b.style.transform = "translateY(0)";
                  b.style.boxShadow = "0 4px 16px rgba(68,23,230,0.28)";
                }}
              >
                Explorar propiedades
                <ArrowRight size={17} />
              </button>

              {/* Secondary — View publication */}
              <button
                onClick={handleViewPublication}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1.5px solid #e0e0e8",
                  borderRadius: 16,
                  padding: "15px 18px",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#4417E6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = "#f0eeff";
                  b.style.borderColor = "#4417E6";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.background = "transparent";
                  b.style.borderColor = "#e0e0e8";
                }}
              >
                <Eye size={17} />
                Ver tu publicación
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
