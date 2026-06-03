import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Plus } from "lucide-react";
import { useMyProperties } from "../hooks/useMyProperties";
import { usePropertyPublish } from "../../publish/context/PropertyPublishContext";
import { useAppTheme, useIsAgent } from "../../../../theme/useAppTheme";
import { resolveMediaUrl } from "../../../../lib/api-base";

export default function MyProperties() {
  const navigate = useNavigate();
  const { startCreatePublish } = usePropertyPublish();
  const { properties, loading, error } = useMyProperties();
  const colors = useAppTheme();
  const isAgent = useIsAgent();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

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
      {/* Header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e5e5ea",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#1a1a1a",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <h1
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Mis Propiedades
        </h1>

        {/* Placeholder para acción futura (ej: filtros) */}
        <div style={{ width: 28 }} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {properties.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 24px",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                background: colors.lightBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={40} color={colors.primary} strokeWidth={1.5} />
            </div>

            <div
              style={{
                textAlign: "center",
                maxWidth: 280,
              }}
            >
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1a1a1a",
                }}
              >
                {isAgent
                  ? "Todavia no tenes propiedades asignadas"
                  : "Todavia no publicaste nada"}
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#6e6e73",
                  lineHeight: 1.6,
                }}
              >
                {isAgent
                  ? "Cuando un owner apruebe tu solicitud, la propiedad va a aparecer aca."
                  : "Aca vas a poder ver y gestionar todas tus propiedades."}
              </p>
            </div>

            {!isAgent && (
              <button
                onClick={() => {
                  startCreatePublish();
                  navigate("/publicar");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: colors.primary,
                  border: "none",
                  borderRadius: 16,
                  padding: "14px 28px",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: colors.buttonShadow,
                }}
              >
                <Plus size={20} color="white" />
                Publicar propiedad
              </button>
            )}
          </div>
        ) : (
          properties.map((property) => (
            <div
              key={property.id}
              style={{
                background: "white",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              <img
                src={resolveMediaUrl(property.cover_image) ?? ""}
                alt={property.title}
                loading="lazy"
                decoding="async"
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#1a1a1a",
                    }}
                  >
                    {property.title}
                  </h2>

                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background:
                        property.status === "PUBLISHED" ? "#ecfdf3" : "#fff7ed",
                      color:
                        property.status === "PUBLISHED" ? "#027a48" : "#b54708",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {property.status}
                  </div>
                </div>

                {property.access_type === "ASSIGNED_AGENT" && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignSelf: "flex-start",
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: colors.lightBg,
                      color: colors.primary,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Asignada a vos
                  </div>
                )}

                <div
                  style={{
                    color: "#6e6e73",
                    fontSize: 14,
                  }}
                >
                  {property.city || "Sin ciudad"}
                </div>

                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#1a1a1a",
                  }}
                >
                  US$ {property.price}
                </div>

                <button
                  onClick={() => navigate(`/propiedad/${property.id}`)}
                  style={{
                    marginTop: 8,
                    background: colors.primary,
                    color: "white",
                    border: "none",
                    borderRadius: 14,
                    padding: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: colors.buttonShadow,
                  }}
                >
                  Ver propiedad
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
