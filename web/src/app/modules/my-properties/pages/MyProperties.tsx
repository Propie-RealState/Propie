import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { PropertyManagementRow } from "../../../components/properties/PropertyManagementRow";
import "../../../components/properties/property-presentation.css";
import { useMyProperties } from "../hooks/useMyProperties";
import { useAuth } from "../../../../context/AuthContext";
import { updatePropertyStatus } from "../services/property-status.service";
import { usePropertyPublish } from "../../publish/context/PropertyPublishContext";
import { useAppTheme, useIsAgent } from "../../../../theme/useAppTheme";
import { PropertyListSkeleton } from "../../../components/skeletons/PageSkeletons";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { pageShellStyle } from "../../../components/layout/layout-styles";
import { ConversionEmptyState } from "../../../components/onboarding/ConversionEmptyState";
import { ActivationChecklist } from "../../../components/onboarding/ActivationChecklist";
import { getOwnerActivationSteps } from "../../../../lib/onboarding/activation";

export default function MyProperties() {
  const navigate = useNavigate();
  const { startCreatePublish } = usePropertyPublish();
  const { user } = useAuth();
  const { properties, loading, error, refetch } = useMyProperties();
  const [updatingStatusId, setUpdatingStatusId] = React.useState<string | null>(
    null,
  );
  const colors = useAppTheme();
  const isAgent = useIsAgent();
  const activationSteps = user?.id
    ? isAgent
      ? []
      : getOwnerActivationSteps(user.id, properties.length)
    : [];

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#f5f5f7",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <PropertyListSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          textAlign: "center",
          color: "#6e6e73",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div>
          <p style={{ margin: "0 0 12px" }}>{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              background: colors.primary,
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
      <div style={{ ...pageShellStyle, background: "#f5f5f7" }}>
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
          paddingBottom: 100,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflowY: "auto",
        }}
      >
        {properties.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {activationSteps.length > 0 && (
              <ActivationChecklist
                title="Próximos pasos para publicar"
                steps={activationSteps}
              />
            )}
            <ConversionEmptyState
              icon={Building2}
              title={
                isAgent
                  ? "Todavía no tenés propiedades asignadas"
                  : "Publicá tu primera propiedad"
              }
              description={
                isAgent
                  ? "Cuando un propietario apruebe tu solicitud, la propiedad aparece acá."
                  : "Creá tu aviso, subí fotos y empezá a recibir consultas."
              }
              benefit={
                isAgent
                  ? "Un panel claro te ayuda a responder más rápido."
                  : "Los avisos con buenas fotos reciben más consultas."
              }
              ctaLabel={isAgent ? "Explorar propiedades" : "Publicar propiedad"}
              onCta={() => {
                if (isAgent) {
                  navigate("/explore");
                  return;
                }
                startCreatePublish();
                navigate("/publicar");
              }}
            />
          </div>
        ) : (
          properties.map((property) => (
            <PropertyManagementRow
              key={property.id}
              property={property}
              currentUserId={user?.id}
              isUpdating={updatingStatusId === property.id}
              colors={colors}
              onNavigate={() => navigate(`/propiedad/${property.id}`)}
              onStatusChange={async (nextStatus) => {
                setUpdatingStatusId(property.id);
                try {
                  await updatePropertyStatus(property.id, nextStatus);
                  await refetch();
                } catch (statusError) {
                  console.error("Status update failed", statusError);
                } finally {
                  setUpdatingStatusId(null);
                }
              }}
            />
          ))
        )}
      </div>

      <AppFooterNav />
    </div>
  );
}
