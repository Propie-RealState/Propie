import { useEffect, useState } from "react";
import { PropertyCompactCard } from "../../../components/properties/PropertyCompactCard";
import "../../../components/properties/property-presentation.css";
import { mapPropertyDtoToProperty } from "../../explore/mappers/property.mapper";
import type { Property } from "../../explore/types/property.types";
import {
  getAgentCommercializedProperties,
  getOwnerPublishedProperties,
} from "../services/agents.service";

type ProfilePropertiesListProps = {
  title: string;
  userId: string;
  variant: "agent" | "owner";
  backTo?: string;
};

export function ProfilePropertiesList({
  title,
  userId,
  variant,
  backTo,
}: ProfilePropertiesListProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data =
          variant === "agent"
            ? await getAgentCommercializedProperties(userId)
            : await getOwnerPublishedProperties(userId);
        if (!cancelled) {
          setProperties(data.map(mapPropertyDtoToProperty));
        }
      } catch {
        if (!cancelled) {
          setProperties([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, variant]);

  if (loading) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: "20px",
          border: "1.5px solid #e5e5ea",
        }}
      >
        <h3
          style={{
            margin: "0 0 14px",
            fontSize: 15,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {title}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "#9a9aa0" }}>
          Cargando propiedades...
        </p>
      </div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: "20px",
        border: "1.5px solid #e5e5ea",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: 15,
          fontWeight: 700,
          color: "#1a1a1a",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {title}
      </h3>

      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCompactCard
            key={property.id}
            property={property}
            isFav={false}
            onToggleFav={() => {}}
            showFavorite={false}
            backTo={backTo}
          />
        ))}
      </div>
    </div>
  );
}
