import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { AuthContext } from "../Root";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  Edit,
  Shield,
  Star,
  Home,
  Briefcase,
  Eye,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

// Mock user data
const mockUser = {
  name: "Juan Pérez",
  email: "juan.perez@gmail.com",
  phone: "+54 9 11 1234-5678",
  location: "Palermo, CABA",
  memberSince: "Enero 2024",
  verified: true,
  photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  stats: {
    propie: {
      properties: 3,
      activeChats: 5,
      views: 1240,
    },
    agente: {
      activeListings: 12,
      totalDeals: 28,
      rating: 4.8,
    },
  },
};

export default function Profile() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useOutletContext<AuthContext>();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Detect user type
  const userType = sessionStorage.getItem("userType") || "propie";
  const isAgent = userType === "agente";

  const colors = {
    primary: isAgent ? "#FF6B35" : "#4A35FF",
    gradient: isAgent
      ? "linear-gradient(135deg, #FF8C5B 0%, #FF6B35 100%)"
      : "linear-gradient(135deg, #5B48FF 0%, #4A35FF 100%)",
    lightBg: isAgent
      ? "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)"
      : "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userType");
    setIsLoggedIn(false);
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
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
          Perfil
        </h1>

        <button
          onClick={() => navigate("/configuracion")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <Settings size={20} color="#1a1a1a" />
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 20px 40px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Profile Card */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "28px 24px",
              border: "1.5px solid #e5e5ea",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background decoration */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 80,
                background: colors.gradient,
                opacity: 0.1,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Profile Photo & Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={mockUser.photo}
                    alt={mockUser.name}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `3px solid ${colors.primary}`,
                    }}
                  />
                  {mockUser.verified && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#10b981",
                        border: "3px solid white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Shield size={12} color="white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#1a1a1a",
                      fontFamily: "'Sora', sans-serif",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {mockUser.name}
                  </h2>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: colors.lightBg,
                      padding: "4px 10px",
                      borderRadius: 8,
                      marginTop: 6,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: colors.primary }}>
                      {isAgent ? "Agente" : "Propie"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/editar-perfil")}
                  style={{
                    background: colors.lightBg,
                    border: "none",
                    borderRadius: 12,
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Edit size={18} color={colors.primary} />
                </button>
              </div>

              {/* User Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Mail size={18} color="#6e6e73" />
                  <span style={{ fontSize: 14, color: "#1a1a1a" }}>{mockUser.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Phone size={18} color="#6e6e73" />
                  <span style={{ fontSize: 14, color: "#1a1a1a" }}>{mockUser.phone}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <MapPin size={18} color="#6e6e73" />
                  <span style={{ fontSize: 14, color: "#1a1a1a" }}>{mockUser.location}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Calendar size={18} color="#6e6e73" />
                  <span style={{ fontSize: 14, color: "#6e6e73" }}>Miembro desde {mockUser.memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              border: "1.5px solid #e5e5ea",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Estadísticas
            </h3>

            {isAgent ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ textAlign: "center", padding: "16px 12px", background: "#f5f5f7", borderRadius: 14 }}>
                  <Briefcase size={22} color={colors.primary} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                    {mockUser.stats.agente.activeListings}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>Publicaciones</div>
                </div>
                <div style={{ textAlign: "center", padding: "16px 12px", background: "#f5f5f7", borderRadius: 14 }}>
                  <Home size={22} color={colors.primary} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                    {mockUser.stats.agente.totalDeals}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>Operaciones</div>
                </div>
                <div style={{ textAlign: "center", padding: "16px 12px", background: "#f5f5f7", borderRadius: 14 }}>
                  <Star size={22} color={colors.primary} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                    {mockUser.stats.agente.rating}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>Rating</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ textAlign: "center", padding: "16px 12px", background: "#f5f5f7", borderRadius: 14 }}>
                  <Home size={22} color={colors.primary} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                    {mockUser.stats.propie.properties}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>Propiedades</div>
                </div>
                <div style={{ textAlign: "center", padding: "16px 12px", background: "#f5f5f7", borderRadius: 14 }}>
                  <Eye size={22} color={colors.primary} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                    {mockUser.stats.propie.views}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>Vistas</div>
                </div>
                <div style={{ textAlign: "center", padding: "16px 12px", background: "#f5f5f7", borderRadius: 14 }}>
                  <MessageCircle size={22} color={colors.primary} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                    {mockUser.stats.propie.activeChats}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>Chats</div>
                </div>
              </div>
            )}
          </div>

          {/* Menu Options */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "8px",
              border: "1.5px solid #e5e5ea",
            }}
          >
            {/* Notifications */}
            <button
              onClick={() => navigate("/notificaciones")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                borderRadius: 12,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "none";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: colors.lightBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={20} color={colors.primary} />
              </div>
              <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
                Notificaciones
              </span>
              <ChevronRight size={20} color="#9a9aa0" />
            </button>

            {/* Help */}
            <button
              onClick={() => navigate("/ayuda")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                borderRadius: 12,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "none";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: colors.lightBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HelpCircle size={20} color={colors.primary} />
              </div>
              <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
                Ayuda y soporte
              </span>
              <ChevronRight size={20} color="#9a9aa0" />
            </button>

            {/* Terms */}
            <button
              onClick={() => navigate("/terminos")}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                borderRadius: 12,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "none";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: colors.lightBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={20} color={colors.primary} />
              </div>
              <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
                Términos y privacidad
              </span>
              <ChevronRight size={20} color="#9a9aa0" />
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              width: "100%",
              background: "white",
              border: "1.5px solid #fee2e2",
              borderRadius: 16,
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "white";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#fee2e2";
            }}
          >
            <LogOut size={20} color="#ef4444" />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#ef4444" }}>Cerrar sesión</span>
          </button>

          {/* Version */}
          <p style={{ textAlign: "center", fontSize: 12, color: "#9a9aa0", marginTop: 8 }}>
            Versión 1.0.0
          </p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "28px 24px",
              maxWidth: 400,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: 20,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              ¿Cerrar sesión?
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6e6e73", lineHeight: 1.6 }}>
              ¿Estás seguro que querés cerrar sesión? Vas a tener que volver a ingresar para acceder a tu cuenta.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1,
                  background: "white",
                  border: "1.5px solid #e5e5ea",
                  borderRadius: 14,
                  padding: "14px",
                  color: "#1a1a1a",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  background: "#ef4444",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
