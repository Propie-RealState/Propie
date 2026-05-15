import { useState } from "react";
import { useNavigate } from "react-router-dom";

import React from "react";
import {
  Search, SlidersHorizontal, MapPin, ChevronDown,
  Heart, Home, User, LogIn, LogOut, MessageCircle,
  Bed, Bath, Maximize2, Plus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Use relative paths – these files live in src/imports/RootLayout/
import img1 from "../../imports/RootLayout/71c2f00331e78173a8b44e4ac5fcd936694f9cec.png";
import img2 from "../../imports/RootLayout/6966e76bf59b02c78ce1d6f3c1956e42958cfb7b.png";
import img3 from "../../imports/RootLayout/3a8c9b173ccc55e86e94cfc589e80cacfc252d8d.png";
import img4 from "../../imports/RootLayout/e1041fb41d1936e1459c7a875fb51d57fbde9e5d.png";
import img5 from "../../imports/RootLayout/0a44d72717c2afb262c3f3865623d40f6aa7059d.png";
import img6 from "../../imports/RootLayout/da343c1bbd74b93ed331f154e12faf2e114008c7.png";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  rooms: number;
  bathrooms: number;
  sqm: number;
  isNew: boolean;
  type: "venta" | "alquiler";
  image: string;
  distance: string;
}

const PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Departamento moderno",
    location: "Palermo, CABA",
    price: "USD 450.000",
    rooms: 2, bathrooms: 2, sqm: 85,
    isNew: true, type: "venta",
    image: img1, distance: "1.2 km",
  },
  {
    id: 2,
    title: "Casa con jardín",
    location: "Belgrano, CABA",
    price: "USD 850.000",
    rooms: 4, bathrooms: 3, sqm: 220,
    isNew: false, type: "venta",
    image: img2, distance: "2.8 km",
  },
  {
    id: 3,
    title: "Loft contemporáneo",
    location: "Recoleta, CABA",
    price: "USD 380.000",
    rooms: 1, bathrooms: 1, sqm: 65,
    isNew: true, type: "venta",
    image: img3, distance: "0.9 km",
  },
  {
    id: 4,
    title: "Piso ejecutivo",
    location: "Puerto Madero, CABA",
    price: "USD 1.200.000",
    rooms: 3, bathrooms: 2, sqm: 140,
    isNew: false, type: "venta",
    image: img4, distance: "3.4 km",
  },
  {
    id: 5,
    title: "Departamento ático",
    location: "Núñez, CABA",
    price: "USD 2.800/mes",
    rooms: 2, bathrooms: 1, sqm: 90,
    isNew: false, type: "alquiler",
    image: img5, distance: "4.1 km",
  },
  {
    id: 6,
    title: "Monoambiente premium",
    location: "San Telmo, CABA",
    price: "USD 1.200/mes",
    rooms: 1, bathrooms: 1, sqm: 42,
    isNew: true, type: "alquiler",
    image: img6, distance: "1.7 km",
  },
];

// ─── Property Card ────────────────────────────────────────────────
function PropertyCard({
  property,
  isFav,
  onToggleFav,
}: {
  property: Property;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "white",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0",
      }}
    >
      {/* Image */}
      <div className="relative" style={{ height: 190 }}>
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)" }}
        />

        {/* Badges row top */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {property.isNew && (
            <span
              className="rounded-full px-3 py-1"
              style={{ background: "#4417E6", color: "white", fontSize: 11, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}
            >
              Nuevo
            </span>
          )}
          <span
            className="rounded-full px-2 py-1 flex items-center gap-1"
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)" }}
          >
            <MapPin size={11} color="#4417E6" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#1a1a1a", fontFamily: "'Inter', sans-serif" }}>
              {property.distance}
            </span>
          </span>
        </div>

        {/* Fav button */}
        <button
          onClick={onToggleFav}
          className="absolute top-3 right-3 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            width: 36, height: 36,
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
            border: "none", cursor: "pointer",
            backdropFilter: "blur(6px)",
          }}
        >
          <Heart
            size={17}
            fill={isFav ? "#ff4466" : "none"}
            color={isFav ? "#ff4466" : "#1a1a1a"}
            strokeWidth={1.8}
          />
        </button>

        {/* Price bottom */}
        <div
          className="absolute bottom-3 left-3 rounded-full px-3 py-1"
          style={{ background: "rgba(255,255,255,0.97)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Inter', sans-serif" }}>
            {property.price}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-4">
        <h3
          style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px", marginBottom: 3 }}
        >
          {property.title}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <MapPin size={12} color="#6e6e73" />
          <span style={{ fontSize: 13, color: "#6e6e73", fontFamily: "'Inter', sans-serif" }}>
            {property.location}
          </span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-5 mb-4">
          <div className="flex items-center gap-1">
            <Bed size={14} color="#4417E6" strokeWidth={1.8} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", fontFamily: "'Inter', sans-serif" }}>
              {property.rooms} amb.
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={14} color="#4417E6" strokeWidth={1.8} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", fontFamily: "'Inter', sans-serif" }}>
              {property.bathrooms} baños
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 size={14} color="#4417E6" strokeWidth={1.8} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", fontFamily: "'Inter', sans-serif" }}>
              {property.sqm} m²
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/propiedad/${property.id}`)}
          className="w-full rounded-2xl py-3 transition-all active:scale-95"
          style={{ background: "#4417E6", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(68,23,230,0.28)" }}
        >
          <span style={{ color: "white", fontSize: 14, fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>
            Ver detalles
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Footer Nav ───────────────────────────────────────────────────
function FooterNav({
  isLoggedIn,
  onLogout,
}: {
  isLoggedIn: boolean;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const navBtn = (icon: React.ReactNode, label: string, onClick?: () => void) => (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        background: "none", border: "none", cursor: "pointer",
        padding: "6px 10px", borderRadius: 12, flex: 1,
      }}
    >
      {icon}
      <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif", color: "#6e6e73" }}>
        {label}
      </span>
    </button>
  );

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
            {navBtn(<Plus size={22} color="#6e6e73" strokeWidth={1.8} />, "Publicar", () => navigate("/publicar"))}
            {navBtn(<Heart size={22} color="#6e6e73" strokeWidth={1.8} />, "Favoritos")}
            {navBtn(<MessageCircle size={22} color="#6e6e73" strokeWidth={1.8} />, "Mensajes")}
            {navBtn(<User size={22} color="#6e6e73" strokeWidth={1.8} />, "Perfil")}
            {navBtn(<LogOut size={22} color="#6e6e73" strokeWidth={1.8} />, "Salir", handleLogout)}
          </>
        ) : (
          <>
            {/* Inicio */}
            <button
              onClick={() => navigate("/")}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: "none", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 12,
              }}
            >
              <Home size={22} color="#6e6e73" strokeWidth={1.8} />
              <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif", color: "#6e6e73" }}>Inicio</span>
            </button>

            {/* Ingresar — destacado */}
            <button
              onClick={() => navigate("/ingresar")}
              style={{
                flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#4417E6", border: "none", cursor: "pointer",
                borderRadius: 18, padding: "10px 0", margin: "2px 10px",
                boxShadow: "0 4px 14px rgba(68,23,230,0.30)",
              }}
            >
              <LogIn size={18} color="white" strokeWidth={2} />
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "white" }}>
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
  const {
    user,
    logout,
  } = useAuth();
  const isLoggedIn = !!user;
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<"todos" | "venta" | "alquiler">("todos");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFav = (id: number) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const filtered = PROPERTIES.filter((p) => {
    const matchType = activeType === "todos" || p.type === activeType;
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
        <div style={{ padding: "14px 16px 12px", display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Search bar */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#f5f5f7", borderRadius: 16,
              padding: "0 14px", height: 48,
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
                flex: 1, background: "none", border: "none", outline: "none",
                fontSize: 14, color: "#1a1a1a", fontFamily: "'Inter', sans-serif",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9a9aa0", fontSize: 20, lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            )}
          </div>

          {/* Row 1 — Ubicación (full width, same as search bar) */}
          <button
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "#f0eeff", border: "none", cursor: "pointer",
              borderRadius: 16, height: 44, width: "100%",
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
              display: "flex", alignItems: "center", gap: 8,
              overflowX: "auto",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <button onClick={() => setActiveType("todos")} style={pillStyle(activeType === "todos")}>Todos</button>
            <button onClick={() => setActiveType("alquiler")} style={pillStyle(activeType === "alquiler")}>Alquiler</button>
            <button onClick={() => setActiveType("venta")} style={pillStyle(activeType === "venta")}>Venta</button>

            <div style={{ width: 1, height: 22, background: "#e5e5ea", flexShrink: 0 }} />

            <button
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "white", border: "1.5px solid #e5e5ea",
                cursor: "pointer", borderRadius: 20, padding: "8px 14px", flexShrink: 0,
              }}
            >
              <SlidersHorizontal size={14} color="#1a1a1a" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>Más filtros</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── PROPERTIES LIST ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 8px" }}
        ref={(el) => {
          if (el) el.style.setProperty("scrollbar-width", "none");
        }}
      >
        {/* Results count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
            {filtered.length} propiedades cerca tuyo
          </span>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#4417E6", fontWeight: 600 }}>
            Ordenar ↕
          </button>
        </div>

        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 }}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={{ fontSize: 15, color: "#6e6e73", textAlign: "center" }}>
              No encontramos propiedades con esos filtros.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                isFav={favorites.includes(p.id)}
                onToggleFav={() => toggleFav(p.id)}
              />
            ))}
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>

      {/* ── FOOTER ── */}
      <FooterNav
        isLoggedIn={isLoggedIn}
        onLogout={() => {
          logout();
          navigate("/");
        }}
      />
    </div>
  );
}