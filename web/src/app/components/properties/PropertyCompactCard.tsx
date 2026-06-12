import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Building2, Heart, MapPin } from "lucide-react";
import type { Property } from "../../modules/explore/types/property.types";
import { formatPrice } from "../../modules/explore/utils/formatPrice";
import {
  formatOperationType,
  formatPropertyType,
} from "../../modules/map/utils/map-format";
import { useAppTheme } from "../../../theme/useAppTheme";
import "./property-presentation.css";

interface PropertyCompactCardProps {
  property: Property;
  isFav: boolean;
  onToggleFav: () => void;
  showFavorite?: boolean;
  backTo?: string;
}

export function PropertyCompactCard({
  property,
  isFav,
  onToggleFav,
  showFavorite = true,
  backTo,
}: PropertyCompactCardProps) {
  const navigate = useNavigate();
  const theme = useAppTheme();
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(property.coverImage) && !imageError;

  const openDetails = () => {
    navigate(`/propiedad/${property.id}`, {
      state: backTo ? { backTo } : undefined,
    });
  };

  return (
    <article
      className="property-compact-card"
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`${property.title}, ${formatPrice(property.price, property.currency)}`}
      style={{
        background: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #e8e8ed",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background: "#f0f0f2",
        }}
      >
        {showImage ? (
          <img
            src={property.coverImage!}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            aria-hidden
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9a9aa0",
            }}
          >
            <Building2 size={28} strokeWidth={1.6} />
          </div>
        )}

        <span
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background:
              property.operationType === "SALE" ? theme.saleBadge : "#10b981",
            color: "#fff",
            padding: "3px 8px",
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: 0.2,
            lineHeight: 1.3,
          }}
        >
          {formatOperationType(property.operationType).toUpperCase()}
        </span>

        {showFavorite && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFav();
            }}
            aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            <Heart
              size={16}
              fill={isFav ? "#ef4444" : "transparent"}
              color={isFav ? "#ef4444" : "#1f1f25"}
            />
          </button>
        )}
      </div>

      <div style={{ padding: "10px 10px 12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#1f1f25",
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1.2,
            }}
          >
            {formatPrice(property.price, property.currency)}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#6e6e73",
              background: "#f3f4f6",
              padding: "2px 6px",
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            {formatPropertyType(property.propertyType)}
          </span>
        </div>

        <h3
          style={{
            margin: "0 0 4px",
            fontSize: 13,
            fontWeight: 600,
            color: "#1f1f25",
            lineHeight: 1.3,
            fontFamily: "'Roboto', sans-serif",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {property.title}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "#6e6e73",
            fontSize: 11,
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          <MapPin size={11} aria-hidden />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {property.location || "Ubicación no especificada"}
          </span>
        </div>
      </div>
    </article>
  );
}
