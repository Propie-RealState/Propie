import { ChevronDown, ChevronRight } from "lucide-react";
import type { PropertyStatus } from "../../modules/my-properties/types/my-properties.types";
import type { OwnedProperty } from "../../modules/my-properties/types/my-properties.types";
import { formatPrice } from "../../modules/explore/utils/formatPrice";
import { resolveMediaUrl } from "../../../lib/api-base";
import type { AppTheme } from "../../../theme/app-theme";
import "./property-presentation.css";

const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: "ACTIVE", label: "Activa" },
  { value: "PAUSED", label: "Pausada" },
  { value: "RESERVED", label: "Reservada" },
  { value: "FINALIZED", label: "Finalizada" },
];

function getStatusStyle(status: PropertyStatus) {
  switch (status) {
    case "ACTIVE":
      return { bg: "#ecfdf3", text: "#027a48", ring: "#a7f3d0" };
    case "PAUSED":
      return { bg: "#fff7ed", text: "#b54708", ring: "#fed7aa" };
    case "RESERVED":
      return { bg: "#eff6ff", text: "#1d4ed8", ring: "#bfdbfe" };
    case "FINALIZED":
      return { bg: "#f3f4f6", text: "#6b7280", ring: "#e5e7eb" };
  }
}

function formatPublishedLabel(publishedAt: string | null) {
  if (!publishedAt) {
    return null;
  }

  const published = new Date(publishedAt);
  if (Number.isNaN(published.getTime())) {
    return null;
  }

  const diffMs = Date.now() - published.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    return "Publicada hoy";
  }

  if (days === 1) {
    return "Publicada hace 1 día";
  }

  if (days < 30) {
    return `Publicada hace ${days} días`;
  }

  return `Publicada ${published.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  })}`;
}

interface PropertyManagementRowProps {
  property: OwnedProperty;
  currentUserId?: string;
  isUpdating: boolean;
  onStatusChange: (status: PropertyStatus) => Promise<void>;
  onNavigate: () => void;
  colors: AppTheme;
}

export function PropertyManagementRow({
  property,
  currentUserId,
  isUpdating,
  onStatusChange,
  onNavigate,
  colors,
}: PropertyManagementRowProps) {
  const statusStyle = getStatusStyle(property.status);
  const publishedLabel = formatPublishedLabel(property.published_at);
  const location = [property.city, property.province].filter(Boolean).join(", ");
  const canEditStatus =
    Boolean(property.published_at) && currentUserId === property.publisher_id;

  const agentLabel =
    property.publisher_id && currentUserId !== property.publisher_id
      ? property.publisher_name?.trim() ||
        (property.publisher_type === "AGENT" ? "Agente asignado" : "Publicador")
      : null;

  return (
    <div
      className="property-management-row"
      role="button"
      tabIndex={0}
      onClick={onNavigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onNavigate();
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e8e8ed",
      }}
    >
      <img
        src={resolveMediaUrl(property.cover_image) ?? ""}
        alt=""
        loading="lazy"
        decoding="async"
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          objectFit: "cover",
          flexShrink: 0,
          background: "#f0f0f2",
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 2,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "#1f1f25",
              fontFamily: "'Montserrat', sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {property.title}
          </h2>

          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#1f1f25",
              flexShrink: 0,
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            {formatPrice(
              property.price,
              property.currency === "ARS" ? "ARS" : "USD",
            )}
          </span>
        </div>

        <p
          style={{
            margin: "0 0 4px",
            fontSize: 12,
            color: "#6e6e73",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          {location || "Sin ubicación"}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {property.access_type === "ASSIGNED_AGENT" && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: colors.primary,
                background: colors.lightBg,
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              Asignada a vos
            </span>
          )}

          {agentLabel && (
            <span
              style={{
                fontSize: 11,
                color: "#6e6e73",
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              {agentLabel}
            </span>
          )}

          {publishedLabel && (
            <span
              style={{
                fontSize: 11,
                color: "#9a9aa0",
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              {publishedLabel}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {canEditStatus ? (
          <div style={{ position: "relative", display: "inline-flex" }}>
            <select
              value={property.status}
              disabled={isUpdating}
              aria-label="Estado de la propiedad"
              onChange={async (event) => {
                await onStatusChange(event.target.value as PropertyStatus);
              }}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                padding: "5px 26px 5px 10px",
                borderRadius: 999,
                border: `1px solid ${statusStyle.ring}`,
                background: statusStyle.bg,
                color: statusStyle.text,
                fontSize: 11,
                fontWeight: 800,
                cursor: isUpdating ? "wait" : "pointer",
                opacity: isUpdating ? 0.7 : 1,
                outline: "none",
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              color={statusStyle.text}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                opacity: 0.8,
              }}
            />
          </div>
        ) : (
          <span
            style={{
              padding: "5px 10px",
              borderRadius: 999,
              background: statusStyle.bg,
              color: statusStyle.text,
              fontSize: 11,
              fontWeight: 700,
              border: `1px solid ${statusStyle.ring}`,
            }}
          >
            {STATUS_OPTIONS.find((o) => o.value === property.status)?.label ??
              property.status}
          </span>
        )}

        <ChevronRight size={16} color="#9a9aa0" aria-hidden />
      </div>
    </div>
  );
}
