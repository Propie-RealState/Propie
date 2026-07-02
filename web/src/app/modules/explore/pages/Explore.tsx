import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PropertyCompactCard } from "../../../components/properties/PropertyCompactCard";
import "../../../components/properties/property-presentation.css";
import GlobalSearchBar from "../components/GlobalSearchBar";
import React from "react";
import {
  SlidersHorizontal,
  MapPin,
  ChevronDown,
  Search,
  X,
  Map,
} from "lucide-react";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import type { GlobalSearchSelection } from "../types/global-search.types";
import { useAuth } from "../../../../context/AuthContext";
import type { Property } from "../types/property.types";
import { getPublishedProperties } from "../services/explore.service";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { useMapStore } from "../../map/stores/useMapStore";
import type { MapFilters } from "../../map/types/map.types";
import {
  pageShellStyle,
  pageScrollStyle,
} from "../../../components/layout/layout-styles";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { NotificationsBell } from "../../../components/navigation/NotificationsBell";
import {
  getFavoriteIds,
  toggleFavoriteId,
} from "../../../../lib/favorites-storage";
import { ExplorePageSkeleton } from "../../../components/skeletons/PageSkeletons";

const SCROLL_COMPACT_AT = 60;
const ROW_TRANSITION = "opacity 200ms ease, transform 200ms ease, max-height 200ms ease";

type PropertyTypeOption = {
  label: string;
  value: NonNullable<MapFilters["propertyType"]>;
};

const PROPERTY_TYPES: PropertyTypeOption[] = [
  { label: "Casa", value: "HOUSE" },
  { label: "Depto", value: "APARTMENT" },
  { label: "PH", value: "OFFICE" },
  { label: "Terreno", value: "LAND" },
  { label: "Comercial", value: "COMMERCIAL" },
];

function FilterSheet({
  open,
  onClose,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  theme: ReturnType<typeof useAppTheme>;
}) {
  const filters = useMapStore((s) => s.filters);
  const setFilters = useMapStore((s) => s.setFilters);
  const clearFilters = useMapStore((s) => s.clearFilters);

  const setOperation = (v: MapFilters["operationType"]) =>
    setFilters({ operationType: v });

  const togglePropertyType = (v: NonNullable<MapFilters["propertyType"]>) =>
    setFilters({ propertyType: filters.propertyType === v ? undefined : v });

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: 20,
    border: active ? "none" : "1.5px solid #e5e5ea",
    background: active ? theme.primary : "white",
    color: active ? "white" : "#1a1a1a",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  });

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.42)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "0 20px max(24px, env(safe-area-inset-bottom))",
          maxHeight: "80dvh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e0e0e0" }} />
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 20,
          paddingTop: 8,
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>Filtros</span>
          <button
            onClick={onClose}
            type="button"
            aria-label="Cerrar filtros"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "none",
              background: "#f5f5f7",
              cursor: "pointer",
            }}
          >
            <X size={18} color="#6e6e73" />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#6e6e73", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Tipo de operación
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={pillStyle(!filters.operationType)} onClick={() => setOperation(undefined)}>Todos</button>
            <button style={pillStyle(filters.operationType === "RENT")} onClick={() => setOperation("RENT")}>Alquiler</button>
            <button style={pillStyle(filters.operationType === "SALE")} onClick={() => setOperation("SALE")}>Venta</button>
            <button style={pillStyle(filters.operationType === "TEMPORARY")} onClick={() => setOperation("TEMPORARY")}>Temporal</button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#6e6e73", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Tipo de propiedad
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PROPERTY_TYPES.map((pt) => (
              <button
                key={pt.value}
                style={pillStyle(filters.propertyType === pt.value)}
                onClick={() => togglePropertyType(pt.value)}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          style={{
            width: "100%",
            height: 52,
            borderRadius: 16,
            border: "none",
            background: theme.primary,
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 12,
          }}
        >
          Aplicar filtros
        </button>
        <button
          onClick={() => { clearFilters(); onClose(); }}
          type="button"
          style={{
            width: "100%",
            height: 44,
            borderRadius: 16,
            border: "none",
            background: "none",
            color: theme.primary,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const theme = useAppTheme();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    getPublishedProperties()
      .then((data) => {
        if (cancelled) return;
        setProperties(data);
        setLoadError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("No pudimos cargar las propiedades. Revisá tu conexión e intentá de nuevo.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const onScroll = () => {
      setIsCompact(el.scrollTop > SCROLL_COMPACT_AT);
    };

    el.style.setProperty("scrollbar-width", "none");
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [loading]);

  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const {
    results: searchResults,
    isActive: isSearchActive,
    loading: isSearchLoading,
    error: searchError,
  } = useGlobalSearch(query, 300);

  const operationType = useMapStore((s) => s.filters.operationType);
  const propertyType = useMapStore((s) => s.filters.propertyType);
  const setMapFilters = useMapStore((s) => s.setFilters);

  const activeType: "todos" | "venta" | "alquiler" | "temporal" =
    operationType === "SALE" ? "venta" :
    operationType === "RENT" ? "alquiler" :
    operationType === "TEMPORARY" ? "temporal" : "todos";

  const setActiveType = (type: "todos" | "venta" | "alquiler") =>
    setMapFilters({
      operationType:
        type === "venta" ? "SALE" :
        type === "alquiler" ? "RENT" : undefined,
    });

  const [favorites, setFavorites] = useState<string[]>(getFavoriteIds());

  useEffect(() => {
    const sync = () => setFavorites(getFavoriteIds());
    window.addEventListener("favorites:changed", sync);
    return () => window.removeEventListener("favorites:changed", sync);
  }, []);

  const toggleFav = (id: string) => {
    if (!user) { navigate("/ingresar"); return; }
    toggleFavoriteId(id);
  };

  const searchPropertyIds = useMemo(
    () => new Set(searchResults.properties.map((p) => p.id)),
    [searchResults.properties],
  );

  const handleSearchSelect = (selection: GlobalSearchSelection) => {
    if (selection.kind === "location") setLocationFilter(selection.label);
    else setLocationFilter("");
  };

  const filtered = properties.filter((p) => {
    const matchType =
      activeType === "todos" ||
      (activeType === "venta" && p.operationType === "SALE") ||
      (activeType === "alquiler" && p.operationType === "RENT") ||
      (activeType === "temporal" && p.operationType === "TEMPORARY");

    const matchPropType = !propertyType || p.propertyType === propertyType;
    const loc = locationFilter.trim();

    if (loc) return matchType && matchPropType && p.location.toLowerCase().includes(loc.toLowerCase());
    if (isSearchActive) return matchType && matchPropType && searchPropertyIds.has(p.id);
    return matchType && matchPropType;
  });

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: "7px 16px",
    borderRadius: 20,
    border: active ? "none" : "1.5px solid #e5e5ea",
    background: active ? theme.primary : "white",
    color: active ? "white" : "#1a1a1a",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  });

  const secondaryRowsStyle: React.CSSProperties = {
    overflow: "hidden",
    maxHeight: isCompact ? 0 : 96,
    opacity: isCompact ? 0 : 1,
    transform: isCompact ? "translateY(-8px)" : "translateY(0)",
    transition: ROW_TRANSITION,
    pointerEvents: isCompact ? "none" : "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  if (loading) {
    return (
      <div style={{ ...pageShellStyle, background: "#f5f5f7" }}>
        <ExplorePageSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          ...pageShellStyle,
          background: "#f5f5f7",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 16px", color: "#1a1a1a", fontSize: 16, fontWeight: 600 }}>
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setLoadError(null);
            getPublishedProperties()
              .then((data) => {
                setProperties(data);
                setLoadError(null);
              })
              .catch(() => {
                setLoadError("No pudimos cargar las propiedades. Revisá tu conexión e intentá de nuevo.");
              })
              .finally(() => setLoading(false));
          }}
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            border: "none",
            background: theme.primary,
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div data-page-shell style={{ ...pageShellStyle, background: "#f5f5f7" }}>

      {/* ── HEADER (single layout) ── */}
      <header
        style={{
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          padding: isCompact ? "10px 16px" : "10px 16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: isCompact ? 0 : 8,
        }}
      >
        {/* Row 1 — always visible */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <GlobalSearchBar
              value={query}
              onChange={(nextQuery) => {
                setQuery(nextQuery);
                if (!nextQuery.trim()) setLocationFilter("");
              }}
              onSelect={handleSearchSelect}
              results={searchResults}
              loading={isSearchLoading}
              error={searchError}
              isActive={isSearchActive}
            />
          </div>
          <NotificationsBell />
        </div>

        {/* Rows 2 + 3 — hide when scrolled */}
        <div style={secondaryRowsStyle} aria-hidden={isCompact}>
          <button
            onClick={() => navigate("/mapa")}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: theme.lightBgSolid,
              border: "none",
              cursor: "pointer",
              borderRadius: 14,
              height: 40,
              width: "100%",
              flexShrink: 0,
            }}
          >
            <MapPin size={14} color={theme.primary} />
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.primary }}>
              Ubicación
            </span>
            <ChevronDown size={13} color={theme.primary} />
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            flexShrink: 0,
          }}>
            <button onClick={() => setActiveType("todos")} style={pillStyle(activeType === "todos")}>Todos</button>
            <button onClick={() => setActiveType("alquiler")} style={pillStyle(activeType === "alquiler")}>Alquiler</button>
            <button onClick={() => setActiveType("venta")} style={pillStyle(activeType === "venta")}>Venta</button>
            <div style={{ width: 1, height: 20, background: "#e5e5ea", flexShrink: 0 }} />
            <button
              onClick={() => setShowFilters(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "white",
                border: "1.5px solid #e5e5ea",
                cursor: "pointer",
                borderRadius: 20,
                padding: "7px 14px",
                flexShrink: 0,
              }}
            >
              <SlidersHorizontal size={13} color="#1a1a1a" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>Más filtros</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── PROPERTIES ── */}
      <div
        ref={scrollAreaRef}
        data-explore-scroll
        style={{ ...pageScrollStyle, padding: "14px 16px 8px" }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
            {filtered.length} propiedades cerca tuyo
          </span>
          <button style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: theme.primary,
            fontWeight: 600,
          }}>
            Ordenar ↕
          </button>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 60,
            gap: 12,
          }}>
            <Search size={40} color="#c7c7cc" strokeWidth={1.5} />
            <p style={{ fontSize: 15, color: "#6e6e73", textAlign: "center", margin: 0 }}>
              No encontramos propiedades con esos filtros.
            </p>
          </div>
        ) : (
          <div className="property-grid">
            {filtered.map((property) => (
              <PropertyCompactCard
                key={property.id}
                property={property}
                isFav={favorites.includes(property.id)}
                onToggleFav={() => toggleFav(property.id)}
              />
            ))}
          </div>
        )}
        <div style={{ height: 80 }} />
      </div>

      <AppFooterNav />

      {/* ── FLOATING MAP CTA (visible when header is compact) ── */}
      {isCompact && (
        <button
          type="button"
          onClick={() => navigate("/mapa")}
          aria-label="Ver mapa"
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
            zIndex: 25,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background: theme.primary,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
            transition: "opacity 200ms ease, transform 200ms ease",
          }}
        >
          <Map size={22} color="white" strokeWidth={2.2} />
        </button>
      )}

      <FilterSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        theme={theme}
      />
    </div>
  );
}
