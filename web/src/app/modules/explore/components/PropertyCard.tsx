import { useNavigate } from "react-router-dom";
import type { Property } from "../types/property.types";
import { formatPrice } from "../utils/formatPrice";

import React from "react";
import { Heart, MapPin, Bed, Bath, Maximize2 } from "lucide-react";
import { useAppTheme } from "../../../../theme/useAppTheme";

interface PropertyCardProps {
  property: Property;
  isFav: boolean;
  onToggleFav: () => void;
}

export default function PropertyCard({
  property,
  isFav,
  onToggleFav
}: PropertyCardProps) {
  const navigate = useNavigate();
  const theme = useAppTheme();

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,.08)",
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 240,
          overflow: "hidden",
        }}
      >
        <img
          src={property.coverImage || ""}
          alt={property.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Badge */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            background:
              property.operationType === "SALE" ? theme.saleBadge : "#10b981",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 0.3,
          }}
        >
          {property.operationType === "SALE" ? "VENTA" : "ALQUILER"} •{" "}
          {property.propertyType === "HOUSE"
            ? "CASA"
            : property.propertyType === "APARTMENT"
              ? "DEPTO"
              : property.propertyType === "COMMERCIAL"
                ? "COMERCIAL"
                : property.propertyType === "LAND"
                  ? "TERRENO"
                  : property.propertyType}
        </div>

        {/* Favorite */}
        <button
          onClick={onToggleFav}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 46,
            height: 46,
            borderRadius: "50%",
            border: "none",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,.12)",
          }}
        >
          <Heart
            size={22}
            fill={isFav ? "#ef4444" : "transparent"}
            color={isFav ? "#ef4444" : "#111"}
          />
        </button>

        {/* Price */}
        <div
          style={{
            position: "absolute",
            left: 18,
            bottom: 18,
            background: "#fff",
            padding: "12px 18px",
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 20,
            boxShadow: "0 4px 18px rgba(0,0,0,.12)",
          }}
        >
          {formatPrice(property.price)}
        </div>
      </div>

      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {property.title}
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#6e6e73",
            fontSize: 18,
          }}
        >
          <MapPin size={18} />
          <span>{property.location || "Ubicación no especificada"}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            marginTop: 6,
            color: "#222",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Bed size={18} />
            <span>{property.rooms || 0} amb.</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Bath size={18} />
            <span>{property.bathrooms || 0} baños</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Maximize2 size={18} />
            <span>{property.sqm || 0} m²</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/propiedad/${property.id}`)}
          style={{
            marginTop: 10,
            border: "none",
            borderRadius: 18,
            padding: "16px 20px",
            background: theme.primary,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
}
