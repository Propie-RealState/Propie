import { useNavigate } from "react-router-dom";
import { UserPlus, LogIn, Search, ChevronRight } from "lucide-react";
import { useAuth } from "../Root";
import React from "react";

/** Marca: rgb(68, 23, 230) */
const BRAND = {
  primary: "#4417E6",
  tint: "rgba(68, 23, 230, 0.12)",
  tintSoft: "rgba(68, 23, 230, 0.08)",
  shadow: "rgba(68, 23, 230, 0.22)",
  focusRing: "rgba(68, 23, 230, 0.12)",
};

/** Secundario marca (PDF): rgb(197, 46, 62) */
const SECONDARY = "#C52E3E";
const EXPLORE_BG = "#fff6f0";

/** Misma separación que entre tarjetas; bajo el logo un poco más de aire */
const CARD_GAP = 14;
const LOGO_SRC = "/brand/logo-home-header.png";

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        background: "#ffffff",
      }}
    >
      {/* ── CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 24px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 480 }}>
          {/* Logo: mismo ancho que las tarjetas; alto acotado al bloque de una tarjeta */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 22,
            }}
          >
            <img
              src={LOGO_SRC}
              alt="propie — rápido, seguro, fácil"
              decoding="async"
              style={{
                width: "100%",
                maxHeight: 120,
                height: "auto",
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: CARD_GAP }}>
          {/* Explorar — tarjeta horizontal (fondo melocotón suave) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate("/explorar")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/explorar");
              }
            }}
            style={{
              background: EXPLORE_BG,
              borderRadius: 22,
              padding: "20px 18px",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
              border: "1.5px solid rgba(197, 46, 62, 0.18)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(197,46,62,0.14)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(197, 46, 62, 0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 14px rgba(0,0,0,0.06)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(197, 46, 62, 0.18)";
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 10px rgba(197,46,62,0.12)",
              }}
            >
              <Search size={26} color={SECONDARY} strokeWidth={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontFamily: "'Sora', sans-serif",
                  letterSpacing: "-0.35px",
                }}
              >
                Explorar propiedades
              </h3>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6e6e73", lineHeight: 1.45 }}>
                Buscá entre miles de opciones
              </p>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "rgba(197, 46, 62, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ChevronRight size={18} color={SECONDARY} strokeWidth={2.5} />
            </div>
          </div>

          {/* Ya tengo cuenta */}
          {!isLoggedIn && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate("/ingresar")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/ingresar");
                }
              }}
              style={{
                background: "white",
                borderRadius: 22,
                padding: "20px 18px",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
                border: "1.5px solid #ececf0",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 22px ${BRAND.shadow}`;
                (e.currentTarget as HTMLDivElement).style.borderColor = BRAND.primary;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 14px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#ececf0";
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${BRAND.tintSoft} 0%, ${BRAND.tint} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: `0 2px 10px ${BRAND.focusRing}`,
                }}
              >
                <LogIn size={26} color={BRAND.primary} strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "-0.35px",
                  }}
                >
                  Ya tengo cuenta
                </h3>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6e6e73", lineHeight: 1.45 }}>
                  Ingresá a tu cuenta
                </p>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: BRAND.tint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ChevronRight size={18} color={BRAND.primary} strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* Registrate */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate("/registro")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/registro");
              }
            }}
            style={{
              background: "white",
              borderRadius: 22,
              padding: "20px 18px",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
              border: "1.5px solid #ececf0",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 22px ${BRAND.shadow}`;
              (e.currentTarget as HTMLDivElement).style.borderColor = BRAND.primary;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 14px rgba(0,0,0,0.06)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#ececf0";
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${BRAND.tintSoft} 0%, ${BRAND.tint} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 2px 10px ${BRAND.focusRing}`,
              }}
            >
              <UserPlus size={26} color={BRAND.primary} strokeWidth={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontFamily: "'Sora', sans-serif",
                  letterSpacing: "-0.35px",
                }}
              >
                Registrate
              </h3>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6e6e73", lineHeight: 1.45 }}>
                Creá tu cuenta y empezá a publicar o encontrar propiedades
              </p>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: BRAND.tint,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ChevronRight size={18} color={BRAND.primary} strokeWidth={2.5} />
            </div>
          </div>

          {/* Features */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              border: "1.5px solid #e5e5ea",
              marginTop: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: BRAND.primary,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.4 }}>
                  Más de 10.000 propiedades disponibles
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: BRAND.primary,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.4 }}>
                  Conectate directo con propietarios
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: BRAND.primary,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.4 }}>
                  Sin comisiones ocultas
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Footer text */}
        <p
          style={{
            marginTop: 32,
            textAlign: "center",
            color: "#9a9aa0",
            fontSize: 12,
            lineHeight: 1.6,
            maxWidth: 360,
          }}
        >
          Al continuar aceptás nuestros{" "}
          <span style={{ color: BRAND.primary, fontWeight: 600 }}>Términos de uso</span> y{" "}
          <span style={{ color: BRAND.primary, fontWeight: 600 }}>Política de privacidad</span>
        </p>
      </div>
    </div>
  );
}