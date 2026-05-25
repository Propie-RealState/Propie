import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import React from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Map,
  ChevronDown,
  Bed,
  Bath,
  Maximize2,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import type { Property } from "../types/property.types";
import { getPublishedProperties } from "../services/explore.service";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { useMapStore } from "../../map/stores/useMapStore";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { NotificationsBell } from "../../../components/navigation/NotificationsBell";
import {
  getFavoriteIds,
  toggleFavoriteId,
} from "../../../../lib/favorites-storage";

// ─── Main Page ────────────────────────────────────────────────────
export default function Explore() {
  const navigate = useNavigate();
  const theme = useAppTheme();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadProperties() {
      const data = await getPublishedProperties();

      setProperties(data);

      setLoading(false);
    }

    loadProperties();
  }, []);

  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const operationType = useMapStore((state) => state.filters.operationType);
  const setMapFilters = useMapStore((state) => state.setFilters);
  const activeType: "todos" | "venta" | "alquiler" =
    operationType === "SALE"
      ? "venta"
      : operationType === "RENT"
        ? "alquiler"
        : "todos";
  const setActiveType = (type: "todos" | "venta" | "alquiler") => {
    setMapFilters({
      operationType:
        type === "venta"
          ? "SALE"
          : type === "alquiler"
            ? "RENT"
            : undefined,
    });
  };
  const [favorites, setFavorites] = useState<string[]>(getFavoriteIds());

  useEffect(() => {
    function syncFavorites() {
      setFavorites(getFavoriteIds());
    }

    window.addEventListener("favorites:changed", syncFavorites);
    return () => {
      window.removeEventListener("favorites:changed", syncFavorites);
    };
  }, []);

  const toggleFav = (id: string) => {
    if (!user) {
      navigate("/ingresar");
      return;
    }

    toggleFavoriteId(id);
  };

  const filtered = properties.filter((p) => {
    const matchType =
      activeType === "todos" ||
      (activeType === "venta" && p.operationType === "SALE") ||
      (activeType === "alquiler" && p.operationType === "RENT");
    const matchQuery =
      query.trim() === "" ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.location.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: 20,
    border: active ? "none" : "1.5px solid #e5e5ea",
    background: active ? theme.primary : "white",
    color: active ? "white" : "#1a1a1a",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    transition: "all 0.18s",
    whiteSpace: "nowrap",
    flexShrink: 0,
  });
  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          fontSize: 18,
        }}
      >
        Cargando propiedades...
      </div>
    );
  }
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          flexShrink: 0,
          background: "white",
          borderBottom: "1px solid #f0f0f0",
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          zIndex: 30,
        }}
      >
        {/* Wrapper that constrains search + filters to the same width */}
        <div
          style={{
            padding: "14px 16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              Explorar
            </h1>
            <NotificationsBell />
          </div>

          {/* Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#f5f5f7",
              borderRadius: 16,
              padding: "0 14px",
              height: 48,
              border: "1.5px solid #ececec",
            }}
          >
            <Search size={18} color="#9a9aa0" strokeWidth={2} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar propiedades..."
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: "#1a1a1a",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9a9aa0",
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Row 1 — Ubicación (full width, same as search bar) */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: theme.lightBgSolid,
              border: "none",
              cursor: "pointer",
              borderRadius: 16,
              height: 44,
              width: "calc(100% - 96px)",
            }}
          >
            <MapPin size={14} color={theme.primary} />
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.primary }}>
              Ubicación
            </span>
            <ChevronDown size={14} color={theme.primary} />
          </button>

          <button
            onClick={() => navigate("/mapa")}
            style={{
              position: "absolute",
              right: 16,
              top: 70,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: "#141414",
              border: "none",
              cursor: "pointer",
              borderRadius: 16,
              height: 44,
              padding: "0 15px",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: "0 8px 22px rgba(0,0,0,0.16)",
            }}
          >
            <Map size={15} color="white" />
            Mapa
          </button>

          {/* Row 2 — Todos · Alquiler · Venta · Más filtros (same horizontal margin) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflowX: "auto",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <button
              onClick={() => setActiveType("todos")}
              style={pillStyle(activeType === "todos")}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveType("alquiler")}
              style={pillStyle(activeType === "alquiler")}
            >
              Alquiler
            </button>
            <button
              onClick={() => setActiveType("venta")}
              style={pillStyle(activeType === "venta")}
            >
              Venta
            </button>

            <div
              style={{
                width: 1,
                height: 22,
                background: "#e5e5ea",
                flexShrink: 0,
              }}
            />

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "white",
                border: "1.5px solid #e5e5ea",
                cursor: "pointer",
                borderRadius: 20,
                padding: "8px 14px",
                flexShrink: 0,
              }}
            >
              <SlidersHorizontal size={14} color="#1a1a1a" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                Más filtros
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── PROPERTIES LIST ── */}
      <div
        style={{ flex: 1, overflowY: "auto", padding: "14px 16px 8px" }}
        ref={(el) => {
          if (el) el.style.setProperty("scrollbar-width", "none");
        }}
      >
        {/* Results count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
            {filtered.length} propiedades cerca tuyo
          </span>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#4417E6",
              fontWeight: 600,
            }}
          >
            Ordenar ↕
          </button>
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 60,
              gap: 12,
            }}
          >
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={{ fontSize: 15, color: "#6e6e73", textAlign: "center" }}>
              No encontramos propiedades con esos filtros.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFav={favorites.includes(property.id)}
                onToggleFav={() => toggleFav(property.id)}
              />
            ))}
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>

      {/* ── FOOTER ── */}
      <AppFooterNav />
    </div>
  );
}
