import { useEffect, useState } from "react";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { mapPropertyDetails } from "../mappers/property-details.mapper";
import { getPropertyById } from "../services/property-details.service";
import {
  ArrowLeft,
  Share2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
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
  Briefcase,
} from "lucide-react";

import { findPropertyById } from "../../publish/services/find-property-by-id";

import { mapPropertyToPublishData } from "../mappers/map-property-to-publish-data";

import { usePropertyPublish } from "../../publish/context/PropertyPublishContext";
import {
  getMyAgentApplicationByProperty,
  sendAgentApplication,
  type AgentApplicationStatus,
} from "../../agent-applications/services/agent-applications.service";
import { NotificationsBell } from "../../../components/navigation/NotificationsBell";
import {
  isFavorite,
  toggleFavoriteId,
} from "../../../../lib/favorites-storage";
type UserType = "guest" | "client" | "owner" | "agente" | null;

// ─── Publicado por card ────────────────────────────────────────────────────────

type OwnerInfoForCard = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null | undefined;
  bio: string | null;
  memberSince: string | null;
  totalReviews: number;
  averageRating: number;
  activeProperties: number;
};

function PublicadoPorCard({
  ownerInfo,
  primaryColor,
  onViewProfile,
}: {
  ownerInfo: OwnerInfoForCard;
  primaryColor: string;
  onViewProfile: () => void;
}) {
  const fullName =
    [ownerInfo.firstName, ownerInfo.lastName].filter(Boolean).join(" ") ||
    "Propietario";

  const initial = fullName.charAt(0).toUpperCase();

  const hasReviews = ownerInfo.totalReviews > 0;

  return (
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
          margin: "0 0 14px",
          fontSize: 15,
          fontWeight: 700,
          color: "#1a1a1a",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        Publicado por
      </h3>

      {/* Avatar + Name + Role */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#f0eeff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {ownerInfo.avatarUrl ? (
            <img
              src={ownerInfo.avatarUrl}
              alt={fullName}
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 22, fontWeight: 700, color: primaryColor }}>
              {initial}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>
            {fullName}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "#f5f5f7",
              padding: "3px 8px",
              borderRadius: 6,
              fontSize: 11,
              color: "#6e6e73",
              fontWeight: 600,
            }}
          >
            <Briefcase size={10} color={primaryColor} />
            Propietario
          </div>
        </div>
      </div>

      {/* Reputation row */}
      <div style={{ marginBottom: 12 }}>
        {hasReviews ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={13}
                  color="#f59e0b"
                  fill={s <= Math.round(ownerInfo.averageRating) ? "#f59e0b" : "none"}
                />
              ))}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
              {ownerInfo.averageRating.toFixed(1)}
            </span>
            <span style={{ fontSize: 12, color: "#6e6e73" }}>
              ({ownerInfo.totalReviews} {ownerInfo.totalReviews === 1 ? "reseña" : "reseñas"})
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "#f0f0f5",
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 12,
              color: "#6e6e73",
              fontWeight: 500,
            }}
          >
            ✨ Nuevo en Propie
          </div>
        )}
      </div>

      {/* Properties count */}
      {ownerInfo.activeProperties > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: "#3a3a3c",
            marginBottom: 10,
          }}
        >
          <Briefcase size={12} color="#9a9aa0" />
          <span>
            {ownerInfo.activeProperties}{" "}
            {ownerInfo.activeProperties === 1 ? "propiedad publicada" : "propiedades publicadas"}
          </span>
        </div>
      )}

      {/* Member since */}
      {ownerInfo.memberSince && (
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "#9a9aa0" }}>
          Miembro desde{" "}
          {new Date(ownerInfo.memberSince).toLocaleDateString("es-AR", {
            month: "long",
            year: "numeric",
          })}
        </p>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onViewProfile}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: primaryColor,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Ver perfil completo →
      </button>
    </div>
  );
}

type MappedProperty = ReturnType<typeof mapPropertyDetails>;

function formatOperationType(type: string) {
  if (type === "SALE") return "En venta";
  if (type === "RENT") return "En alquiler";
  return type;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

type PropertyDetailsLocationState = {
  backTo?: string;
};

export default function PropertyDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = (location.state as PropertyDetailsLocationState | null)
    ?.backTo;
  const {
    updateData,
    reset,
  } = usePropertyPublish();
  const { id } = useParams();

  const [property, setProperty] = useState<MappedProperty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      const data = await getPropertyById(id);
      setProperty(data);
      setLoading(false);
    }
    loadProperty();
  }, [id]);

  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [agentApplicationStatus, setAgentApplicationStatus] =
    useState<AgentApplicationStatus | null>(null);
  const [approvedRequests, setApprovedRequests] = useState<string[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ from: string; message: string; time: string }>
  >([]);

  const getUserType = (): UserType => {
    if (!isLoggedIn) return "guest";
    if (user?.role === "AGENT") return "agente";
    if (user?.role === "OWNER") return "owner";
    if (user?.role === "CLIENT") return "client";
    return "client";
  };

  const userType = getUserType();
  const isOwner =
    userType === "owner" &&
    (!property || property.ownerId === user?.id);
  const isAgent = userType === "agente";
  const canManageProperty =
    isOwner || agentApplicationStatus === "ACCEPTED";
  const requestSent =
    agentApplicationStatus === "PENDING" ||
    agentApplicationStatus === "REJECTED";

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

  const totalPhotos = property?.images?.length || 0;

  useEffect(() => {
    async function loadAgentApplicationStatus() {
      if (!id || !user || user.role !== "AGENT") {
        setAgentApplicationStatus(null);
        return;
      }

      try {
        const application = await getMyAgentApplicationByProperty(id);
        setAgentApplicationStatus(application?.status ?? null);
      } catch (error) {
        console.error("Error loading agent application status:", error);
        setAgentApplicationStatus(null);
      }
    }

    loadAgentApplicationStatus();
  }, [id, user?.id, user?.role]);

  const nextPhoto = () => {
    if (!totalPhotos) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % totalPhotos);
  };

  const prevPhoto = () => {
    if (!totalPhotos) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const handleShare = () => {
    navigate(`/compartir/${property?.id}`);
  };

  const handleApplyAgent = () => {
    setShowRequestModal(true);
  };

  const handleSendRequest = async () => {
    if (!property?.id || !requestMessage.trim()) return;

    try {
      setIsSendingRequest(true);

      await sendAgentApplication({
        propertyId: property.id,
        message: requestMessage,
      });

      setAgentApplicationStatus("PENDING");
      setShowRequestModal(false);
      setRequestMessage("");
      window.dispatchEvent(new Event("agent-applications:changed"));
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      alert("No pudimos enviar la solicitud. Intentá nuevamente.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleApproveRequest = (requestId: string, agentName: string) => {
    setApprovedRequests((prev) => [...prev, requestId]);
    setSelectedAgent(agentName);
    setTimeout(() => setShowChat(true), 1000);
  };

  const handleRejectRequest = (requestId: string) => {
    setRejectedRequests((prev) => [...prev, requestId]);
  };

  const handleUndoReject = (requestId: string) => {
    setRejectedRequests((prev) => prev.filter((rid) => rid !== requestId));
  };

  const handleOpenChat = (agentName: string) => {
    setSelectedAgent(agentName);
    setShowChat(true);
  };

  const handleOpenOwnerProfile = () => {
    if (!property?.ownerId || !property?.id) {
      return;
    }

    navigate(`/perfil/${property.ownerId}`, {
      state: {
        reviewPropertyId: property.id,
        reviewPropertyTitle: property.title,
      },
    });
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        from: "Propie",
        message: chatMessage,
        time: new Date().toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages((prev) => [...prev, newMessage]);
      setChatMessage("");
    }
  };

  const handleEdit = async () => {
    if (!property?.id) {
      return;
    }
  
    try {
      reset();
  
      const propertyData =
        await findPropertyById(property.id);
  
      const mappedProperty =
        mapPropertyToPublishData(
          propertyData
        );
  
      updateData({
        ...mappedProperty,
        publishMode: "edit",
      });
  
      navigate("/publicar");
    } catch (error) {
      console.error(
        "Error hydrating property edit:",
        error
      );
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!property) {
    return <div>Propiedad no encontrada</div>;
  }

  const locationParts = [
    property.location.address,
    property.location.neighborhood,
    property.location.city,
    property.location.province,
  ].filter(Boolean);

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
          onClick={() => {
            if (backTo) {
              navigate(backTo);
              return;
            }

            navigate(-1);
          }}
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
          {isLoggedIn && <NotificationsBell />}
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
          {canManageProperty && (
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
                onClick={handleEdit}
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
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/10",
          background: "#000",
        }}
      >
        <img
          src={property.images[currentPhotoIndex]?.url}
          alt="Propiedad"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

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
          {currentPhotoIndex + 1} / {totalPhotos}
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
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
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
              {formatOperationType(property.operationType)}
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
              {formatPrice(property.price)}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#6e6e73",
                fontSize: 14,
              }}
            >
              <MapPin size={16} />
              <span>{locationParts.join(", ")}</span>
            </div>
          </div>

          {/* Title & Description */}
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
              {property.title}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                color: "#1a1a1a",
                lineHeight: 1.6,
              }}
            >
              {property.description}
            </p>
          </div>

          {/* Quick data */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Bed size={24} color={colors.primary} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>
                {property.bedrooms}
              </div>
              <div style={{ fontSize: 12, color: "#6e6e73" }}>Ambientes</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Bath size={24} color={colors.primary} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>
                {property.bathrooms}
              </div>
              <div style={{ fontSize: 12, color: "#6e6e73" }}>Baños</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Maximize size={24} color={colors.primary} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>
                {property.areaM2}
              </div>
              <div style={{ fontSize: 12, color: "#6e6e73" }}>m²</div>
            </div>
          </div>

          {/* Publicado por — visible to everyone except the property owner */}
          {property.ownerInfo && !isOwner && (
            <PublicadoPorCard
              ownerInfo={property.ownerInfo as {
                id: string;
                firstName: string | null;
                lastName: string | null;
                avatarUrl: string | null | undefined;
                bio: string | null;
                memberSince: string | null;
                totalReviews: number;
                averageRating: number;
                activeProperties: number;
              }}
              primaryColor={colors.primary}
              onViewProfile={handleOpenOwnerProfile}
            />
          )}

          {/* CASO 2: Propie - Estado y gestión */}
          {canManageProperty && (
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
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      background: "#f5f5f7",
                      borderRadius: 12,
                    }}
                  >
                    <Eye size={20} color={colors.primary} style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>
                      {property.views}
                    </div>
                    <div style={{ fontSize: 11, color: "#6e6e73" }}>Vistas</div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      background: "#f5f5f7",
                      borderRadius: 12,
                    }}
                  >
                    <Users size={20} color={colors.primary} style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>0</div>
                    <div style={{ fontSize: 11, color: "#6e6e73" }}>Solicitudes</div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      background: "#f5f5f7",
                      borderRadius: 12,
                    }}
                  >
                    <MessageCircle
                      size={20}
                      color={colors.primary}
                      style={{ margin: "0 auto 6px" }}
                    />
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>0</div>
                    <div style={{ fontSize: 11, color: "#6e6e73" }}>Chats</div>
                  </div>
                </div>
              </div>

              {/* Agentes activos */}
              {property.agents.length > 0 && (
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

                  {property.agents.map((agent) => {
                    const a = agent as {
                      id?: string;
                      name?: string;
                      photo?: string;
                      rating?: number;
                      totalReviews?: number;
                      activeListings?: number;
                    };
                    const listingCount = a.activeListings ?? 0;
                    return (
                      <div
                        key={a.id ?? Math.random()}
                        style={{
                          background: colors.lightBg,
                          borderRadius: 14,
                          padding: "16px",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 12,
                          }}
                        >
                          {a.photo && (
                            <img
                              src={a.photo}
                              alt={a.name}
                              loading="lazy"
                              decoding="async"
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: "#1a1a1a",
                                marginBottom: 2,
                              }}
                            >
                              {a.name ?? ""}
                            </div>
                            <div style={{ fontSize: 12, color: "#6e6e73", display: "flex", alignItems: "center", gap: 4 }}>
                              <Star
                                size={12}
                                color="#f59e0b"
                                fill={a.rating ? "#f59e0b" : "none"}
                              />
                              <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
                                {a.rating ? a.rating.toFixed(1) : "—"}
                              </span>
                              {a.totalReviews !== undefined && a.totalReviews > 0 && (
                                <span>({a.totalReviews})</span>
                              )}
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
                            onClick={() => handleOpenChat(a.name ?? "Agente")}
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
                          {a.id && (
                            <button
                              onClick={() =>
                                navigate(`/agentes/${a.id}`, {
                                  state: {
                                    reviewPropertyId: property.id,
                                    reviewPropertyTitle: property.title,
                                  },
                                })
                              }
                              style={{
                                background: "white",
                                border: "1.5px solid #e5e5ea",
                                borderRadius: 10,
                                padding: "10px 14px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 5,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#1a1a1a",
                              }}
                            >
                              <UserCheck size={15} color={colors.primary} />
                              Perfil
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#1a1a1a",
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {selectedAgent}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
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
                      ¡Gracias por aprobar mi solicitud! Me encantaría coordinar una
                      visita para conocer mejor la propiedad.
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#9a9aa0", marginTop: 4, marginLeft: 4 }}
                  >
                    Ahora
                  </div>
                </div>
              </div>

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
                        borderRadius:
                          msg.from === "Propie"
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                        maxWidth: 280,
                        display: "inline-block",
                      }}
                    >
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.message}</div>
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#9a9aa0", marginTop: 4, marginLeft: 4 }}
                    >
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
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
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
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              >
                <X size={24} color="#1a1a1a" />
              </button>
            </div>

            <p
              style={{
                margin: "0 0 20px",
                fontSize: 14,
                color: "#6e6e73",
                lineHeight: 1.6,
              }}
            >
              Enviale un mensaje al propietario explicando por qué sos el agente ideal para
              comercializar esta propiedad.
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
                disabled={!requestMessage.trim() || isSendingRequest}
                style={{
                  flex: 1,
                  background:
                    requestMessage.trim() && !isSendingRequest
                      ? colors.primary
                      : "#e5e5ea",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px",
                  color:
                    requestMessage.trim() && !isSendingRequest
                      ? "white"
                      : "#9a9aa0",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor:
                    requestMessage.trim() && !isSendingRequest
                      ? "pointer"
                      : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Send size={16} />
                {isSendingRequest ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA sticky - Registered client (explore-only account) */}
      {userType === "client" && (
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
            type="button"
            onClick={() => {
              if (id) {
                toggleFavoriteId(id);
              }
            }}
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
            <Heart
              size={22}
              color={id && isFavorite(id) ? colors.primary : "#1a1a1a"}
              fill={id && isFavorite(id) ? colors.primary : "none"}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowChat(true)}
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

      {/* CTA sticky - Guest */}
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
            type="button"
            onClick={() => navigate("/ingresar")}
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
            type="button"
            onClick={() => navigate("/ingresar")}
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
      {isAgent && !canManageProperty && (
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
            disabled={requestSent}
            style={{
              flex: 1,
              background: requestSent ? "#dcfce7" : colors.gradient,
              border: "none",
              borderRadius: 14,
              padding: "16px",
              color: requestSent ? "#166534" : "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: requestSent ? "default" : "pointer",
              boxShadow: requestSent ? "none" : colors.shadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {requestSent ? <CheckCircle size={20} /> : <Briefcase size={20} />}
            {requestSent ? "Solicitud enviada" : "Enviar solicitud"}
          </button>
        </div>
      )}
    </div>
  );
}
