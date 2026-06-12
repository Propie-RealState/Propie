import { useEffect, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import {
  ArrowLeft,
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
  Check,
  X,
  Shield,
  Star,
  Home,
  Eye,
  Briefcase,
  MessageCircle,
  ChevronRight,
  Heart,
  TrendingUp,
} from "lucide-react";
import { updateMyProfile } from "../services/profile.service";
import { useAppTheme, useIsAgent } from "../../../../theme/useAppTheme";
import { useOwnerApplicationCount } from "../../agent-applications/hooks/useOwnerApplicationCount";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { NotificationsBell } from "../../../components/navigation/NotificationsBell";
import {
  canPublishProperties,
  isClientRole,
} from "../../../../lib/roles";
import { StarRating } from "../../../components/StarRating";
import { useAgentReviews } from "../../agents/hooks/useAgentReviews";
import { resolveMediaUrl } from "../../../../lib/api-base";
import { showToast } from "../../../../lib/toast";

export default function Profile() {
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const { user, logout, refreshUser } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [phone, setPhone] = useState("");

  const [location, setLocation] = useState("");

  const [bio, setBio] = useState("");

  const [dni, setDni] = useState("");

  const [birthDate, setBirthDate] = useState("");

  const [nationality, setNationality] = useState("");

  const [address, setAddress] = useState("");

  const [cuitCuil, setCuitCuil] = useState("");

  useEffect(() => {
    if (!user) return;
  
    setPhone(user.profile?.phone || "");
  
    setLocation(user.profile?.location || "");
  
    setBio(user.profile?.bio || "");
  
    setDni(user.profile?.dni || "");
  
    setBirthDate(user.profile?.birth_date || "");
  
    setNationality(user.profile?.nationality || "");
  
    setAddress(user.profile?.address || "");
  
    setCuitCuil(user.profile?.cuit_cuil || "");
  }, [user]);

  const displayLocation =
    user?.profile?.location ||
    user?.profile?.address ||
    user?.profile?.nationality ||
    "Sin ubicación";

  const displayPhone = user?.profile?.phone || "Sin teléfono";

  const memberSinceLabel = user?.profile?.created_at
    ? new Date(user.profile.created_at).toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
      })
    : null;

  const realUser = {
    name:
      `${user?.profile?.first_name || ""} ${user?.profile?.last_name || ""}`.trim() ||
      "Usuario",

    email: user?.email,

    phone: displayPhone,

    location: displayLocation,

    memberSince: memberSinceLabel,

    verified: true,

    photo:
      user?.profile?.avatar_url ||
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",

    stats: {
      agente: {
        activeListings: 0,
        totalViews: 0,
        totalChats: 0,
      },

      owner: {
        activeListings: 0,
        totalViews: 0,
        totalChats: 0,
      },
    },
    bio: user?.profile?.bio || "",
  };

  const colors = useAppTheme();
  const isAgent = useIsAgent();
  const isClient = isClientRole(user?.role);
  const showPublisherStats = canPublishProperties(user?.role);
  const { count: pendingApplicationCount } = useOwnerApplicationCount();
  const { reviews, loading: reviewsLoading, hasMore, loadMore } = useAgentReviews(
    isAgent ? user?.id : undefined,
  );

  const averageRating = user?.profile?.average_rating ?? 0;
  const totalReviews = user?.profile?.total_reviews ?? 0;
  const totalWorkedProperties = user?.profile?.total_worked_properties ?? 0;
  const completedProperties = user?.profile?.completed_properties ?? 0;

  const roleLabel = isAgent
    ? "Agente"
    : isClient
      ? "Explorador"
      : "Propietario";

  const handleLogout = () => {
    sessionStorage.removeItem("userType");
    logout();
    setShowLogoutModal(false);
    navigate("/explore");
  };

  function resetFormFromUser() {
    if (!user) return;

    setPhone(user.profile?.phone || "");
    setLocation(user.profile?.location || "");
    setBio(user.profile?.bio || "");
    setDni(user.profile?.dni || "");
    setBirthDate(user.profile?.birth_date || "");
    setNationality(user.profile?.nationality || "");
    setAddress(user.profile?.address || "");
    setCuitCuil(user.profile?.cuit_cuil || "");
  }

  function handleStartEditing() {
    resetFormFromUser();
    setIsEditing(true);
  }

  function handleCancelEdit() {
    resetFormFromUser();
    setIsEditing(false);
  }

  async function handleSaveProfile() {
    try {
      setIsSaving(true);

      await updateMyProfile({
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
      });

      await refreshUser();

      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showToast("Error actualizando perfil");
    } finally {
      setIsSaving(false);
    }
  }

  const editableFieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1.5px solid ${colors.primary}`,
    background: "#f9f9fb",
    fontSize: 14,
    color: "#1a1a1a",
    outline: "none",
    boxSizing: "border-box",
  };

  if (!user) {
    return null;
  }
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

        <NotificationsBell />
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
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
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
                background: colors.heroGradient,
                opacity: 0.1,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Profile Photo & Name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={realUser.photo}
                    alt={realUser.name}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `3px solid ${colors.primary}`,
                    }}
                  />
                  {realUser.verified && (
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
                    {realUser.name}
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
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.primary,
                      }}
                    >
                      {roleLabel}
                    </span>
                  </div>

                  {isAgent && (
                    <div style={{ marginTop: 6 }}>
                      <StarRating
                        rating={averageRating}
                        totalReviews={totalReviews}
                        size={13}
                        compact={false}
                        showCount={true}
                      />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        title="Cancelar"
                        style={{
                          background: "#f5f5f7",
                          border: "1px solid #e5e5ea",
                          borderRadius: 12,
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isSaving ? "not-allowed" : "pointer",
                        }}
                      >
                        <X size={18} color="#6e6e73" />
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        title="Guardar"
                        style={{
                          background: colors.primary,
                          border: "none",
                          borderRadius: 12,
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: isSaving ? "not-allowed" : "pointer",
                          opacity: isSaving ? 0.7 : 1,
                        }}
                      >
                        <Check size={18} color="white" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEditing}
                      title="Editar perfil"
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
                  )}
                </div>
              </div>

              {/* User Info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: isEditing ? 14 : 0,
                  borderRadius: isEditing ? 14 : 0,
                  background: isEditing ? colors.lightBg : "transparent",
                  border: isEditing
                    ? `1px dashed ${colors.primary}40`
                    : "none",
                }}
              >
                {isEditing && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: colors.primary,
                    }}
                  >
                    Editá los campos resaltados y guardá con ✓
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Mail size={18} color="#6e6e73" />
                  <span style={{ fontSize: 14, color: "#1a1a1a" }}>
                    {realUser.email}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: isEditing ? "flex-start" : "center",
                    gap: 12,
                    flex: 1,
                  }}
                >
                  <Phone
                    size={18}
                    color={isEditing ? colors.primary : "#6e6e73"}
                    style={{ marginTop: isEditing ? 10 : 0 }}
                  />
                  {isEditing ? (
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Teléfono"
                      style={editableFieldStyle}
                    />
                  ) : (
                    <span style={{ fontSize: 14, color: "#1a1a1a" }}>
                      {displayPhone}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: isEditing ? "flex-start" : "center",
                    gap: 12,
                    flex: 1,
                  }}
                >
                  <MapPin
                    size={18}
                    color={isEditing ? colors.primary : "#6e6e73"}
                    style={{ marginTop: isEditing ? 10 : 0 }}
                  />
                  {isEditing ? (
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Localización"
                      style={editableFieldStyle}
                    />
                  ) : (
                    <span style={{ fontSize: 14, color: "#1a1a1a" }}>
                      {displayLocation}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Calendar size={18} color="#6e6e73" />
                  <span style={{ fontSize: 14, color: "#6e6e73" }}>
                    {realUser.memberSince
                      ? `Miembro desde ${realUser.memberSince}`
                      : "Miembro reciente"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showPublisherStats && (
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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 12px",
                    background: "#f5f5f7",
                    borderRadius: 14,
                  }}
                >
                  <Home
                    size={22}
                    color={colors.primary}
                    style={{ margin: "0 auto 8px" }}
                  />
                  <div
                    style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {totalWorkedProperties}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>
                    Trabajadas
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 12px",
                    background: "#f5f5f7",
                    borderRadius: 14,
                  }}
                >
                  <Briefcase
                    size={22}
                    color={colors.primary}
                    style={{ margin: "0 auto 8px" }}
                  />
                  <div
                    style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {completedProperties}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>
                    Cerradas
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 12px",
                    background: "#f5f5f7",
                    borderRadius: 14,
                  }}
                >
                  <Star
                    size={22}
                    color="#f59e0b"
                    fill={averageRating > 0 ? "#f59e0b" : "none"}
                    style={{ margin: "0 auto 8px" }}
                  />
                  <div
                    style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {averageRating > 0 ? averageRating.toFixed(1) : "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>
                    Reputación
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 12px",
                    background: "#f5f5f7",
                    borderRadius: 14,
                  }}
                >
                  <Home
                    size={22}
                    color={colors.primary}
                    style={{ margin: "0 auto 8px" }}
                  />
                  <div
                    style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {realUser.stats.owner.activeListings}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>
                    Propiedades
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 12px",
                    background: "#f5f5f7",
                    borderRadius: 14,
                  }}
                >
                  <Eye
                    size={22}
                    color={colors.primary}
                    style={{ margin: "0 auto 8px" }}
                  />
                  <div
                    style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {realUser.stats.owner.totalViews}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>
                    Vistas
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 12px",
                    background: "#f5f5f7",
                    borderRadius: 14,
                  }}
                >
                  <MessageCircle
                    size={22}
                    color={colors.primary}
                    style={{ margin: "0 auto 8px" }}
                  />
                  <div
                    style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}
                  >
                    {realUser.stats.owner.totalChats}
                  </div>
                  <div style={{ fontSize: 11, color: "#6e6e73", marginTop: 4 }}>
                    Chats
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Agent Reviews Section */}
          {isAgent && (
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: "24px",
                border: "1.5px solid #e5e5ea",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1a1a1a",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Reseñas
                </h3>
                {totalReviews > 0 && (
                  <StarRating
                    rating={averageRating}
                    totalReviews={totalReviews}
                    size={13}
                    compact={true}
                  />
                )}
              </div>

              {reviewsLoading && reviews.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        background: "#f5f5f7",
                        borderRadius: 14,
                        padding: "16px",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    >
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#e5e5ea",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              height: 12,
                              background: "#e5e5ea",
                              borderRadius: 6,
                              width: "60%",
                              marginBottom: 6,
                            }}
                          />
                          <div
                            style={{
                              height: 10,
                              background: "#e5e5ea",
                              borderRadius: 6,
                              width: "40%",
                            }}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          height: 10,
                          background: "#e5e5ea",
                          borderRadius: 6,
                          width: "80%",
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 16px",
                  }}
                >
                  <TrendingUp size={40} color="#d1d1d6" style={{ margin: "0 auto 12px" }} />
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#9a9aa0",
                      lineHeight: 1.5,
                    }}
                  >
                    Todavía no tenés reseñas.
                    <br />
                    ¡Trabajá con propietarios para empezar a construir tu reputación!
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reviews.map((review) => {
                    const reviewerName =
                      [review.reviewer_first_name, review.reviewer_last_name]
                        .filter(Boolean)
                        .join(" ") || "Usuario";
                    const avatarUrl = review.reviewer_avatar_url
                      ? resolveMediaUrl(review.reviewer_avatar_url)
                      : null;
                    const dateLabel = new Date(review.created_at).toLocaleDateString(
                      "es-AR",
                      { day: "numeric", month: "short", year: "numeric" },
                    );

                    return (
                      <div
                        key={review.id}
                        style={{
                          background: "#f5f5f7",
                          borderRadius: 14,
                          padding: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            marginBottom: review.comment ? 10 : 0,
                          }}
                        >
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={reviewerName}
                              loading="lazy"
                              decoding="async"
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: colors.lightBg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: colors.primary,
                                }}
                              >
                                {reviewerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                                marginBottom: 4,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#1a1a1a",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {reviewerName}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#9a9aa0",
                                  flexShrink: 0,
                                }}
                              >
                                {dateLabel}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                  key={n}
                                  size={12}
                                  color="#f59e0b"
                                  fill={n <= review.rating ? "#f59e0b" : "none"}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {review.comment && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              color: "#3a3a3c",
                              lineHeight: 1.55,
                            }}
                          >
                            {review.comment}
                          </p>
                        )}

                        {review.property_title && (
                          <div
                            style={{
                              marginTop: 8,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              background: colors.lightBg,
                              padding: "3px 8px",
                              borderRadius: 6,
                            }}
                          >
                            <Home size={11} color={colors.primary} />
                            <span
                              style={{
                                fontSize: 11,
                                color: colors.primary,
                                fontWeight: 500,
                              }}
                            >
                              {review.property_title}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {hasMore && (
                    <button
                      onClick={loadMore}
                      disabled={reviewsLoading}
                      style={{
                        width: "100%",
                        background: "none",
                        border: `1.5px solid ${colors.primary}30`,
                        borderRadius: 12,
                        padding: "12px",
                        color: colors.primary,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: reviewsLoading ? "not-allowed" : "pointer",
                        opacity: reviewsLoading ? 0.6 : 1,
                      }}
                    >
                      {reviewsLoading ? "Cargando..." : "Ver más reseñas"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Menu Options */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "8px",
              border: "1.5px solid #e5e5ea",
            }}
          >
            {/* Favorites */}
            <button
              onClick={() => navigate("/favoritos")}
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
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "none";
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
                <Heart size={20} color={colors.primary} />
              </div>
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Favoritos
              </span>
              <ChevronRight size={20} color="#9a9aa0" />
            </button>

            <button
              onClick={() => navigate("/visitas")}
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
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "none";
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
                <Calendar size={20} color={colors.primary} />
              </div>
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Calendario
              </span>
              <ChevronRight size={20} color="#9a9aa0" />
            </button>

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
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "none";
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
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Notificaciones
              </span>
              {pendingApplicationCount > 0 && (
                <span
                  style={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: 999,
                    background: "#ef4444",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "0 7px",
                  }}
                >
                  {pendingApplicationCount}
                </span>
              )}
              <ChevronRight size={20} color="#9a9aa0" />
            </button>

            {/* Settings */}
            <button
              onClick={() => navigate("/configuracion")}
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
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "none";
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
                <Settings size={20} color={colors.primary} />
              </div>
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Configuración
              </span>
              <ChevronRight size={20} color="#9a9aa0" />
            </button>

            {!isClient && (
            <>
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
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "none";
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
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
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
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f5f5f7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "none";
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
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Términos y privacidad
              </span>
              <ChevronRight size={20} color="#9a9aa0" />
            </button>
            </>
            )}
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
              (e.currentTarget as HTMLButtonElement).style.background =
                "#fee2e2";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#ef4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "white";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#fee2e2";
            }}
          >
            <LogOut size={20} color="#ef4444" />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#ef4444" }}>
              Cerrar sesión
            </span>
          </button>

          {/* Version */}
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#9a9aa0",
              marginTop: 8,
            }}
          >
            Versión 1.0.0
          </p>
        </div>
      </div>

      <AppFooterNav />

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
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 14,
                color: "#6e6e73",
                lineHeight: 1.6,
              }}
            >
              ¿Estás seguro que querés cerrar sesión? Vas a tener que volver a
              ingresar para acceder a tu cuenta.
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
