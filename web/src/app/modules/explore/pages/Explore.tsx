import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import React from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ChevronDown,
  Home,
  User,
  LogIn,
  MessageCircle,
  Bed,
  Bath,
  Maximize2,
  Plus,
  Building2,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import type { Property } from "../types/property.types";
import { getPublishedProperties } from "../services/explore.service";

// ─── Footer Nav ───────────────────────────────────────────────────
function FooterNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const navBtn = (
    Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>,
    label: string,
    path: string,
  ) => {
    const isActive = currentPath === path || currentPath.startsWith(path + "/");
    const color = isActive ? "#4417E6" : "#6e6e73";
    return (
      <button
        key={path}
        onClick={() => navigate(path)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 10px",
          borderRadius: 12,
          flex: 1,
        }}
      >
        <Icon size={22} color={color} strokeWidth={1.8} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            color,
          }}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div
      style={{
        flexShrink: 0,
        background: "white",
        borderTop: "1px solid #efefef",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.07)",
        paddingBottom: "max(env(safe-area-inset-bottom), 4px)",
      }}
    >
      <div className="flex items-center px-3 py-2">
        {isLoggedIn ? (
          <>
            {navBtn(Plus, "Publicar", "/publicar")}
            {navBtn(Building2, "Mis Props.", "/mis-propiedades")}
            {navBtn(MessageCircle, "Mensajes", "/mensajes")}
            {navBtn(User, "Perfil", "/perfil")}
          </>
        ) : (
          <>
            {/* Inicio */}
            <button
              onClick={() => navigate("/")}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: 12,
              }}
            >
              <Home size={22} color="#6e6e73" strokeWidth={1.8} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  color: "#6e6e73",
                }}
              >
                Inicio
              </span>
            </button>

            {/* Ingresar — destacado */}
            <button
              onClick={() => navigate("/ingresar")}
              style={{
                flex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#4417E6",
                border: "none",
                cursor: "pointer",
                borderRadius: 18,
                padding: "10px 0",
                margin: "2px 10px",
                boxShadow: "0 4px 14px rgba(68,23,230,0.30)",
              }}
            >
              <LogIn size={18} color="white" strokeWidth={2} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Sora', sans-serif",
                  color: "white",
                }}
              >
                Ingresar
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function Explore() {
  const navigate = useNavigate();

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

  const isLoggedIn = !!user;
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<"todos" | "venta" | "alquiler">(
    "todos",
  );
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFav = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

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
    background: active ? "#4417E6" : "white",
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
          }}
        >
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
              background: "#f0eeff",
              border: "none",
              cursor: "pointer",
              borderRadius: 16,
              height: 44,
              width: "100%",
            }}
          >
            <MapPin size={14} color="#4417E6" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#4417E6" }}>
              Ubicación
            </span>
            <ChevronDown size={14} color="#4417E6" />
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
      <FooterNav isLoggedIn={isLoggedIn} />
    </div>
  );
}
