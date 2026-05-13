import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Root";
import React from "react";
import {
  ArrowLeft,
  Share2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  UserCheck,
  Star,
  Send,
  Edit,
  BarChart3,
  MoreVertical,
  Eye,
  Heart,
  Users,
  CheckCircle,
  Clock,
  X,
  Calendar,
  Briefcase,
  Award,
} from "lucide-react";

// Mock property data
const mockProperty = {
  id: "1",
  title: "Hermoso departamento en Palermo",
  description: "Departamento de 2 ambientes con excelente luminosidad, balcón con vista, cocina equipada y baño completo. Ubicado en el corazón de Palermo, cerca de todos los servicios.",
  price: "USD 285,000",
  operationType: "venta" as const,
  propertyType: "departamento" as const,
  address: "Av. Córdoba 3456, Palermo, CABA",
  rooms: 2,
  bathrooms: 1,
  sqm: 65,
  garage: 0,
  amenities: ["balcon", "cocina-equipada"],
  photos: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  ],
  owner: {
    id: "owner1",
    name: "Juan Pérez",
    verified: true,
    rating: 4.8,
  },
  status: "activa" as const,
  stats: {
    views: 245,
    agentRequests: 3,
    activeChats: 2,
  },
  agents: [
    {
      id: "agent1",
      name: "María González",
      rating: 4.9,
      zone: "Palermo/Belgrano",
      experience: "5 años",
      activeListings: 12,
      status: "approved" as const,
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
  ],
  agentRequests: [
    {
      id: "req1",
      agent: {
        id: "agent2",
        name: "Carlos Rodríguez",
        rating: 4.7,
        zone: "Palermo",
        experience: "3 años",
        activeListings: 8,
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      },
      message: "Hola! Me especializo en Palermo y me gustaría comercializar tu propiedad.",
      date: "Hace 2 días",
      status: "pending" as const,
    },
  ],
};

type UserType = "guest" | "propie" | "agente" | null;

export default function PropertyDetails() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [approvedRequests, setApprovedRequests] = useState<string[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ from: string; message: string; time: string }>>([]);

  // Simular tipo de usuario basado en sessionStorage
  const getUserType = (): UserType => {
    if (!isLoggedIn) return "guest";
    const userType = sessionStorage.getItem("userType");
    return userType === "agente" ? "agente" : "propie";
  };

  const userType = getUserType();
  const isOwner = userType === "propie"; // En producción verificar si el usuario es el dueño
  const isAgent = userType === "agente";
  const hasApplied = false; // Mock: el agente ya aplicó
  const isApproved = false; // Mock: el agente fue aprobado

  // Dynamic colors based on user type
  const colors = {
    primary: isAgent ? "#C52E3E" : "#4417E6",
    gradient: isAgent
      ? "linear-gradient(135deg, #FF8C5B 0%, #C52E3E 100%)"
      : "linear-gradient(135deg, #5A32F0 0%, #4417E6 100%)",
    lightBg: isAgent
      ? "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)"
      : "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)",
    shadow: isAgent
      ? "0 4px 16px rgba(197,46,62,0.24)"
      : "0 4px 16px rgba(68,23,230,0.24)",
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % mockProperty.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + mockProperty.photos.length) % mockProperty.photos.length);
  };

  const handleShare = () => {
    navigate(`/compartir/${mockProperty.id}`);
  };

  const handleApplyAgent = () => {
    setShowRequestModal(true);
  };

  const handleSendRequest = () => {
    console.log("Enviando solicitud:", requestMessage);
    setShowRequestModal(false);
    setRequestMessage("");
  };

  const handleApproveRequest = (requestId: string, agentName: string) => {
    setApprovedRequests([...approvedRequests, requestId]);
    setSelectedAgent(agentName);

    // Auto-abrir chat después de 1 segundo
    setTimeout(() => {
      setShowChat(true);
    }, 1000);
  };

  const handleRejectRequest = (requestId: string) => {
    setRejectedRequests([...rejectedRequests, requestId]);
  };

  const handleUndoReject = (requestId: string) => {
    setRejectedRequests(rejectedRequests.filter(id => id !== requestId));
  };

  const handleOpenChat = (agentName: string) => {
    setSelectedAgent(agentName);
    setShowChat(true);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        from: "Propie",
        message: chatMessage,
        time: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
    }
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

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isLoggedIn && (
            <button
              onClick={() => navigate("/ingresar")}
              style={{
                background: colors.primary,
                border: "none",
                borderRadius: 10,
                padding: "8px 16px",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ingresá
            </button>
          )}
          <button
            onClick={handleShare}
            style={{
              background: "#f0f0f0",
              border: "none",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Share2 size={18} color="#1a1a1a" />
          </button>
          {isOwner && (
            <>
              <button
                style={{
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChart3 size={18} color="#1a1a1a" />
              </button>
              <button
                onClick={() => navigate("/publicar")}
                style={{
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Edit size={18} color="#1a1a1a" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Carrusel de fotos */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", background: "#000" }}>
        <img
          src={mockProperty.photos[currentPhotoIndex]}
          alt="Propiedad"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Navigation arrows */}
        <button
          onClick={prevPhoto}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <ChevronLeft size={24} color="white" />
        </button>
        <button
          onClick={nextPhoto}
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <ChevronRight size={24} color="white" />
        </button>

        {/* Photo counter */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            backdropFilter: "blur(8px)",
          }}
        >
          {currentPhotoIndex + 1} / {mockProperty.photos.length}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 20px 100px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Price & Type */}
          <div>
            <div
              style={{
                display: "inline-block",
                background: colors.primary,
                color: "white",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {mockProperty.operationType}
            </div>
            <h1
              style={{
                margin: "0 0 8px",
                fontSize: 28,
                fontWeight: 800,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {mockProperty.price}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6e6e73", fontSize: 14 }}>
              <MapPin size={16} />
              {mockProperty.address}
            </div>
          </div>

          {/* Title */}
          <div>
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: 20,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {mockProperty.title}
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: "#1a1a1a", lineHeight: 1.6 }}>
              {mockProperty.description}
            </p>
          </div>

          {/* Quick data */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Bed size={24} color={colors.primary} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{mockProperty.rooms}</div>
              <div style={{ fontSize: 12, color: "#6e6e73" }}>Ambientes</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Bath size={24} color={colors.primary} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{mockProperty.bathrooms}</div>
              <div style={{ fontSize: 12, color: "#6e6e73" }}>Baños</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Maximize size={24} color={colors.primary} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{mockProperty.sqm}</div>
              <div style={{ fontSize: 12, color: "#6e6e73" }}>m²</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Car size={24} color={colors.primary} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{mockProperty.garage}</div>
              <div style={{ fontSize: 12, color: "#6e6e73" }}>Cochera</div>
            </div>
          </div>

          {/* CASO 1: Guest - Publicado por */}
          {userType === "guest" && (
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: "20px",
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
                Publicado por
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: colors.lightBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserCheck size={24} color={colors.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>Propie verificado</div>
                  <div style={{ fontSize: 13, color: "#6e6e73", marginTop: 2 }}>
                    {mockProperty.agents.length} agente{mockProperty.agents.length !== 1 ? "s" : ""} trabajando
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "#fff7ed",
                    padding: "6px 10px",
                    borderRadius: 8,
                  }}
                >
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>{mockProperty.owner.rating}</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#6e6e73", lineHeight: 1.6 }}>
                Esta propiedad es verificada por Propie. Registrate para contactar al propietario o agentes.
              </p>
            </div>
          )}

          {/* CASO 2: Propie - Estado y gestión */}
          {isOwner && (
            <>
              {/* Estado */}
              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: "20px",
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
                  Estado de publicación
                </h3>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#dcfce7",
                    color: "#166534",
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  <CheckCircle size={16} />
                  Activa
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  <div style={{ textAlign: "center", padding: "12px", background: "#f5f5f7", borderRadius: 12 }}>
                    <Eye size={20} color={colors.primary} style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{mockProperty.stats.views}</div>
                    <div style={{ fontSize: 11, color: "#6e6e73" }}>Vistas</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px", background: "#f5f5f7", borderRadius: 12 }}>
                    <Users size={20} color={colors.primary} style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{mockProperty.stats.agentRequests}</div>
                    <div style={{ fontSize: 11, color: "#6e6e73" }}>Solicitudes</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px", background: "#f5f5f7", borderRadius: 12 }}>
                    <MessageCircle size={20} color={colors.primary} style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{mockProperty.stats.activeChats}</div>
                    <div style={{ fontSize: 11, color: "#6e6e73" }}>Chats</div>
                  </div>
                </div>
              </div>

              {/* Solicitudes de agentes */}
              {mockProperty.agentRequests.length > 0 && (
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "20px",
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
                    Solicitudes de agentes ({mockProperty.agentRequests.length})
                  </h3>

                  {mockProperty.agentRequests.map((request) => {
                    const isApproved = approvedRequests.includes(request.id);
                    const isRejected = rejectedRequests.includes(request.id);

                    return (
                    <div
                      key={request.id}
                      style={{
                        background: isApproved
                          ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                          : isRejected
                          ? "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)"
                          : "#f5f5f7",
                        borderRadius: 14,
                        padding: "16px",
                        marginBottom: 12,
                        border: isApproved
                          ? "2px solid #10b981"
                          : isRejected
                          ? "2px solid #ef4444"
                          : "none",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {isApproved && (
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            background: "#10b981",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <CheckCircle size={12} />
                          Aprobado
                        </div>
                      )}
                      {isRejected && (
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            background: "#ef4444",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <X size={12} />
                          Rechazado
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                        <img
                          src={request.agent.photo}
                          alt={request.agent.name}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
                            {request.agent.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 6 }}>
                            <Star size={12} color="#f59e0b" fill="#f59e0b" style={{ display: "inline", marginRight: 4 }} />
                            {request.agent.rating} • {request.agent.zone} • {request.agent.experience}
                          </div>
                          <div style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.5 }}>
                            {request.message}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: isApproved ? "#166534" : isRejected ? "#991b1b" : "#9a9aa0", marginBottom: 12 }}>
                        {request.date}
                      </div>

                      {!isApproved && !isRejected ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleApproveRequest(request.id, request.agent.name)}
                            style={{
                              flex: 1,
                              background: colors.primary,
                              border: "none",
                              borderRadius: 10,
                              padding: "10px",
                              color: "white",
                              fontSize: 14,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            style={{
                              flex: 1,
                              background: "white",
                              border: "1.5px solid #e5e5ea",
                              borderRadius: 10,
                              padding: "10px",
                              color: "#1a1a1a",
                              fontSize: 14,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : isApproved ? (
                        <button
                          onClick={() => handleOpenChat(request.agent.name)}
                          style={{
                            width: "100%",
                            background: "#10b981",
                            border: "none",
                            borderRadius: 10,
                            padding: "12px",
                            color: "white",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <MessageCircle size={16} />
                          Abrir chat
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUndoReject(request.id)}
                          style={{
                            width: "100%",
                            background: "white",
                            border: "1.5px solid #ef4444",
                            borderRadius: 10,
                            padding: "12px",
                            color: "#ef4444",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          Deshacer rechazo
                        </button>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}

              {/* Agentes aprobados */}
              {mockProperty.agents.length > 0 && (
                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "20px",
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
                    Agentes activos
                  </h3>

                  {mockProperty.agents.map((agent) => (
                    <div
                      key={agent.id}
                      style={{
                        background: colors.lightBg,
                        borderRadius: 14,
                        padding: "16px",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <img
                          src={agent.photo}
                          alt={agent.name}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 2 }}>
                            {agent.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#6e6e73" }}>
                            <Star size={12} color="#f59e0b" fill="#f59e0b" style={{ display: "inline", marginRight: 4 }} />
                            {agent.rating} • {agent.activeListings} publicaciones activas
                          </div>
                        </div>
                        <div
                          style={{
                            background: colors.primary,
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Autorizado
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleOpenChat(agent.name)}
                          style={{
                            flex: 1,
                            background: colors.primary,
                            border: "none",
                            borderRadius: 10,
                            padding: "10px",
                            color: "white",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <MessageCircle size={16} />
                          Abrir chat
                        </button>
                        <button
                          style={{
                            background: "white",
                            border: "1.5px solid #e5e5ea",
                            borderRadius: 10,
                            padding: "10px 14px",
                            cursor: "pointer",
                          }}
                        >
                          <MoreVertical size={16} color="#1a1a1a" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Modal: Chat */}
      {showChat && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 100,
            padding: 0,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowChat(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px 20px 0 0",
              maxWidth: 640,
              width: "100%",
              height: "80vh",
              display: "flex",
              flexDirection: "column",
              animation: "slideUp 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e5e5ea",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: colors.lightBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserCheck size={22} color={colors.primary} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
                    {selectedAgent}
                  </div>
                  <div style={{ fontSize: 12, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#10b981",
                      }}
                    />
                    En línea
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={24} color="#1a1a1a" />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Welcome message */}
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div
                  style={{
                    background: "#f5f5f7",
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "#6e6e73",
                  }}
                >
                  Chat iniciado con {selectedAgent}
                </div>
              </div>

              {/* Mock initial message from agent */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <UserCheck size={16} color="#C52E3E" />
                </div>
                <div>
                  <div
                    style={{
                      background: "#f5f5f7",
                      padding: "12px 16px",
                      borderRadius: "16px 16px 16px 4px",
                      maxWidth: 280,
                    }}
                  >
                    <div style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.5 }}>
                      ¡Gracias por aprobar mi solicitud! Me encantaría coordinar una visita para conocer mejor la propiedad.
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#9a9aa0", marginTop: 4, marginLeft: 4 }}>
                    Ahora
                  </div>
                </div>
              </div>

              {/* User messages */}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    flexDirection: msg.from === "Propie" ? "row-reverse" : "row",
                  }}
                >
                  {msg.from !== "Propie" && (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <UserCheck size={16} color="#C52E3E" />
                    </div>
                  )}
                  <div style={{ textAlign: msg.from === "Propie" ? "right" : "left" }}>
                    <div
                      style={{
                        background: msg.from === "Propie" ? colors.primary : "#f5f5f7",
                        color: msg.from === "Propie" ? "white" : "#1a1a1a",
                        padding: "12px 16px",
                        borderRadius: msg.from === "Propie" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        maxWidth: 280,
                        display: "inline-block",
                      }}
                    >
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.message}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#9a9aa0", marginTop: 4, marginLeft: 4 }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid #e5e5ea",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Escribí tu mensaje..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1.5px solid #e5e5ea",
                  fontSize: 14,
                  color: "#1a1a1a",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                style={{
                  background: chatMessage.trim() ? colors.primary : "#e5e5ea",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 16px",
                  cursor: chatMessage.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send size={18} color={chatMessage.trim() ? "white" : "#9a9aa0"} />
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Modal: Solicitud de agente */}
      {showRequestModal && (
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
          onClick={() => setShowRequestModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              maxWidth: 480,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Solicitar comercialización
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={24} color="#1a1a1a" />
              </button>
            </div>

            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6e6e73", lineHeight: 1.6 }}>
              Enviale un mensaje al propietario explicando por qué sos el agente ideal para comercializar esta propiedad.
            </p>

            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Hola! Me especializo en esta zona y me gustaría comercializar tu propiedad..."
              rows={6}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                border: "1.5px solid #e5e5ea",
                fontSize: 15,
                color: "#1a1a1a",
                outline: "none",
                resize: "none",
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.6,
                boxSizing: "border-box",
                marginBottom: 16,
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowRequestModal(false)}
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
                onClick={handleSendRequest}
                disabled={!requestMessage}
                style={{
                  flex: 1,
                  background: requestMessage ? colors.primary : "#e5e5ea",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px",
                  color: requestMessage ? "white" : "#9a9aa0",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: requestMessage ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Send size={16} />
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA sticky */}
      {userType === "guest" && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            borderTop: "1px solid #e5e5ea",
            padding: "16px 20px",
            display: "flex",
            gap: 12,
            zIndex: 10,
          }}
        >
          <button
            style={{
              background: "#f0f0f0",
              border: "none",
              borderRadius: 12,
              padding: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={22} color="#1a1a1a" />
          </button>
          <button
            onClick={() => navigate("/registro")}
            style={{
              flex: 1,
              background: colors.primary,
              border: "none",
              borderRadius: 12,
              padding: "14px",
              color: "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <MessageCircle size={20} />
            Contactar
          </button>
        </div>
      )}

      {/* CTA sticky - Agent */}
      {isAgent && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            borderTop: "1px solid #e5e5ea",
            padding: "16px 20px",
            display: "flex",
            gap: 12,
            zIndex: 10,
          }}
        >
          <button
            onClick={handleApplyAgent}
            style={{
              flex: 1,
              background: colors.gradient,
              border: "none",
              borderRadius: 14,
              padding: "16px",
              color: "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: colors.shadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Briefcase size={20} />
            Enviar solicitud
          </button>
        </div>
      )}
    </div>
  );
}
