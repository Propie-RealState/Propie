import { useEffect, useState } from "react";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { setLastViewedProperty } from "../../../../lib/onboarding/last-viewed-property";
import { mapPropertyDetails } from "../mappers/property-details.mapper";
import { getPropertyById } from "../services/property-details.service";
import { formatPrice } from "../utils/formatPrice";
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
  UserCheck,
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
import { EnabledAgentsSection } from "../components/EnabledAgentsSection";
import {
  listPropertyConversations,
  startInternalPropertyConversation,
  startPropertyConversation,
} from "../../property-conversations/services/property-conversations.service";
import { subscribePropertyActiveAgain } from "../../my-properties/services/property-status.service";
import {
  getPropertyStatusLabel,
  getPropertyStatusStyle,
} from "../../my-properties/utils/property-status-display";
import {
  isFavorite,
  toggleFavoriteId,
} from "../../../../lib/favorites-storage";
import { showToast } from "../../../../lib/toast";
import { ExplorePageSkeleton } from "../../../components/skeletons/PageSkeletons";
import {
  modalBackdropStyle,
  modalPanelStyle,
  pageShellStyle,
  pageScrollStyle,
  stickyCtaPadding,
} from "../../../components/layout/layout-styles";

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
      setLoading(true);
      try {
        const data = await getPropertyById(id);
        setProperty(data);
        setLastViewedProperty(id);
      } catch (error) {
        console.error("Error loading property:", error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
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
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [isOpeningInternalChat, setIsOpeningInternalChat] = useState(false);
  const [propertyConversationCount, setPropertyConversationCount] = useState(0);

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
  const isPublisher =
    Boolean(user?.id && property?.publisherId && user.id === property.publisherId);
  const canContactProperty =
    property?.status === "ACTIVE" && property?.allowChat !== false;
  const isPaused = property?.status === "PAUSED";
  const isReserved = property?.status === "RESERVED";
  const publicationStatusStyle = property
    ? getPropertyStatusStyle(property.status)
    : null;
  const PublicationStatusIcon =
    property?.status === "PAUSED" ? Clock : CheckCircle;
  const [isSubscribingStatus, setIsSubscribingStatus] = useState(false);
  const [statusSubscribed, setStatusSubscribed] = useState(false);
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

  useEffect(() => {
    async function loadPropertyConversationCount() {
      if (!property?.id || !canManageProperty) {
        setPropertyConversationCount(0);
        return;
      }

      try {
        const conversations = await listPropertyConversations();
        setPropertyConversationCount(
          conversations.filter(
            (conversation) => conversation.propertyId === property.id,
          ).length,
        );
      } catch (error) {
        console.error("Error loading property conversation count:", error);
        setPropertyConversationCount(0);
      }
    }

    void loadPropertyConversationCount();
  }, [property?.id, canManageProperty, user?.id]);

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
      showToast("No pudimos enviar la solicitud. Intentá nuevamente.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleApproveRequest = (requestId: string) => {
    setApprovedRequests((prev) => [...prev, requestId]);
  };

  const handleRejectRequest = (requestId: string) => {
    setRejectedRequests((prev) => [...prev, requestId]);
  };

  const handleUndoReject = (requestId: string) => {
    setRejectedRequests((prev) => prev.filter((rid) => rid !== requestId));
  };

  const handleOpenChat = async (agentId: string) => {
    if (!property?.id || isOpeningInternalChat) {
      return;
    }

    try {
      setIsOpeningInternalChat(true);
      const conversation = await startInternalPropertyConversation(
        property.id,
        agentId,
      );
      navigate(`/mensajes/${conversation.id}`);
    } catch (error) {
      console.error("Error opening internal conversation:", error);
      showToast("No pudimos abrir el chat. Intentá nuevamente.");
    } finally {
      setIsOpeningInternalChat(false);
    }
  };

  const handleOpenOwnerChat = async () => {
    if (!property?.id || isOpeningInternalChat) {
      return;
    }

    try {
      setIsOpeningInternalChat(true);
      const conversation = await startInternalPropertyConversation(property.id);
      navigate(`/mensajes/${conversation.id}`);
    } catch (error) {
      console.error("Error opening owner conversation:", error);
      showToast("No pudimos abrir el chat. Intentá nuevamente.");
    } finally {
      setIsOpeningInternalChat(false);
    }
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

  const handleContactar = async () => {
    if (!property?.id) {
      return;
    }

    if (!canContactProperty) {
      showToast("El chat no está disponible para esta propiedad.");
      return;
    }

    try {
      setIsStartingConversation(true);
      const conversation = await startPropertyConversation(property.id);
      navigate(`/mensajes/${conversation.id}`);
    } catch (error) {
      console.error("Error starting property conversation:", error);
      showToast(
        "No pudimos iniciar la conversación. Verificá que la propiedad esté publicada.",
      );
    } finally {
      setIsStartingConversation(false);
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
    return (
      <div style={{ ...pageShellStyle, background: "#f5f5f7" }}>
        <ExplorePageSkeleton />
      </div>
    );
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
    <div style={{ ...pageShellStyle, background: "#f5f5f7" }}>
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
          ...pageScrollStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 20px 100px",
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
              {formatPrice(property.price, property.currency)}
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

          {isPaused && (
            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p style={{ margin: 0, color: "#9a3412", fontWeight: 600 }}>
                Esta propiedad está pausada por el momento.
              </p>
              {isLoggedIn && !isPublisher && (
                <button
                  type="button"
                  disabled={isSubscribingStatus || statusSubscribed}
                  onClick={async () => {
                    if (!property?.id) return;
                    setIsSubscribingStatus(true);
                    try {
                      await subscribePropertyActiveAgain(property.id);
                      setStatusSubscribed(true);
                    } catch (error) {
                      console.error("Status subscription failed", error);
                    } finally {
                      setIsSubscribingStatus(false);
                    }
                  }}
                  style={{
                    alignSelf: "flex-start",
                    background: colors.primary,
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontWeight: 700,
                    cursor:
                      isSubscribingStatus || statusSubscribed
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isSubscribingStatus
                    ? "Guardando..."
                    : statusSubscribed
                      ? "Te avisaremos"
                      : "Avisame cuando vuelva a estar activa"}
                </button>
              )}
            </div>
          )}

          {isReserved && (
            <div
              style={{
                alignSelf: "flex-start",
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Reservada
            </div>
          )}

          {!isPublisher && property.publisherName && (
            <p style={{ margin: 0, color: "#6e6e73", fontSize: 14 }}>
              Publicada por {property.publisherName}
            </p>
          )}

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

          {/* Agentes habilitados — visible to everyone */}
          {!canManageProperty && (
            <EnabledAgentsSection
              agents={property.agents}
              primaryColor={colors.primary}
              lightBg={colors.lightBg}
              propertyId={property.id}
              propertyTitle={property.title}
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
                    background: publicationStatusStyle?.bg ?? "#f3f4f6",
                    color: publicationStatusStyle?.text ?? "#6b7280",
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  <PublicationStatusIcon size={16} />
                  {getPropertyStatusLabel(property.status)}
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
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>
                      {propertyConversationCount}
                    </div>
                    <div style={{ fontSize: 11, color: "#6e6e73" }}>Chats</div>
                  </div>
                </div>
              </div>

              <EnabledAgentsSection
                agents={property.agents}
                primaryColor={colors.primary}
                lightBg={colors.lightBg}
                propertyId={property.id}
                propertyTitle={property.title}
                showManagementActions={isOwner}
                showOwnerChat={isAgent}
                onOpenChat={isOwner ? handleOpenChat : undefined}
                onOpenOwnerChat={isAgent ? handleOpenOwnerChat : undefined}
              />

            </>
          )}
        </div>
      </div>

      {/* Modal: Solicitud de agente */}
      {showRequestModal && (
        <div
          style={modalBackdropStyle}
          onClick={() => setShowRequestModal(false)}
        >
          <div
            style={{ ...modalPanelStyle, maxWidth: 480 }}
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
            padding: stickyCtaPadding,
            paddingLeft: "max(20px, env(safe-area-inset-left))",
            paddingRight: "max(20px, env(safe-area-inset-right))",
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
            onClick={() => void handleContactar()}
            disabled={isStartingConversation || !canContactProperty}
            style={{
              flex: 1,
              background: canContactProperty ? colors.primary : "#e5e5ea",
              border: "none",
              borderRadius: 12,
              padding: "14px",
              color: canContactProperty ? "white" : "#9a9aa0",
              fontSize: 16,
              fontWeight: 700,
              cursor:
                isStartingConversation || !canContactProperty
                  ? "not-allowed"
                  : "pointer",
              opacity: isStartingConversation ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <MessageCircle size={20} />
            {isStartingConversation
              ? "Abriendo..."
              : canContactProperty
                ? "Contactar"
                : "Chat no disponible"}
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
            padding: stickyCtaPadding,
            paddingLeft: "max(20px, env(safe-area-inset-left))",
            paddingRight: "max(20px, env(safe-area-inset-right))",
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
      {isAgent && !canManageProperty && property?.acceptsAgentParticipation !== false && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            borderTop: "1px solid #e5e5ea",
            padding: stickyCtaPadding,
            paddingLeft: "max(20px, env(safe-area-inset-left))",
            paddingRight: "max(20px, env(safe-area-inset-right))",
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
