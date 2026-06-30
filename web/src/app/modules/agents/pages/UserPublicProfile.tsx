import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Home,
  Info,
  MapPin,
  Send,
  Shield,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { useAuth } from "../../../../context/AuthContext";
import { resolveMediaUrl } from "../../../../lib/api-base";
import { StarRating } from "../../../components/StarRating";
import {
  checkCanReview,
  createUserReview,
  getUserPublicProfile,
  getUserReviews,
  type AgentReview,
  type UserPublicProfile as UserPublicProfileType,
} from "../services/agents.service";
import { ProfilePropertiesList } from "../components/ProfilePropertiesList";
import { pageScrollStyle, pageShellStyle } from "../../../components/layout/layout-styles";

type UserProfileLocationState = {
  reviewPropertyId?: string;
  reviewPropertyTitle?: string | null;
};

function roleLabelFromCode(code: string | null) {
  if (code === "OWNER") return "Propietario";
  if (code === "AGENT") return "Agente";
  if (code === "CLIENT") return "Explorador";
  return "Usuario";
}

function RoleIcon({ role }: { role: string | null }) {
  if (role === "OWNER") return <Home size={12} />;
  if (role === "AGENT") return <Briefcase size={12} />;
  return <Shield size={12} />;
}

export default function UserPublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const reviewContext = (location.state as UserProfileLocationState | null) ?? {};
  const { user } = useAuth();
  const colors = useAppTheme();

  const [profile, setProfile] = useState<UserPublicProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);

  const [canReview, setCanReview] = useState(false);
  const [canReviewReason, setCanReviewReason] = useState<string | null>(null);
  const [reviewableProperties, setReviewableProperties] = useState<
    Array<{ property_id: string; property_title: string }>
  >([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    reviewContext.reviewPropertyId ?? "",
  );
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const REVIEWS_PAGE = 3;

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    getUserPublicProfile(userId).then((data) => {
      setProfile(data);
      setLoading(false);

      // Redirect agents to full agent profile page
      if (data?.role === "AGENT") {
        navigate(`/agentes/${userId}`, {
          replace: true,
          state: location.state,
        });
      }
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setReviewsLoading(true);
    getUserReviews(userId, REVIEWS_PAGE + 1, 0).then((data) => {
      setHasMoreReviews(data.length > REVIEWS_PAGE);
      setReviews(data.slice(0, REVIEWS_PAGE));
      setReviewsLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    if (!userId || !user || user.id === userId) return;

    checkCanReview(userId, reviewContext.reviewPropertyId).then((result) => {
      setCanReview(result.canReview);
      setCanReviewReason(result.reason);
      setReviewableProperties(result.reviewableProperties);

      if (result.reviewableProperties.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(result.reviewableProperties[0].property_id);
      }
    });
  }, [userId, user?.id, reviewContext.reviewPropertyId]);

  function loadMoreReviews() {
    if (!userId) return;
    setReviewsLoading(true);
    getUserReviews(userId, REVIEWS_PAGE + 1, reviews.length).then((data) => {
      setHasMoreReviews(data.length > REVIEWS_PAGE);
      setReviews((prev) => [...prev, ...data.slice(0, REVIEWS_PAGE)]);
      setReviewsLoading(false);
    });
  }

  async function handleSubmitReview() {
    if (!userId || !selectedPropertyId || reviewRating === 0) return;

    try {
      setSubmittingReview(true);
      setReviewError(null);
      await createUserReview({
        targetUserId: userId,
        propertyId: selectedPropertyId,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment("");
      setCanReview(false);
      setCanReviewReason("ALREADY_REVIEWED");

      const [updatedProfile, updatedReviews] = await Promise.all([
        getUserPublicProfile(userId),
        getUserReviews(userId, REVIEWS_PAGE + 1, 0),
      ]);
      setProfile(updatedProfile);
      setHasMoreReviews(updatedReviews.length > REVIEWS_PAGE);
      setReviews(updatedReviews.slice(0, REVIEWS_PAGE));
    } catch {
      setReviewError("No pudimos publicar la reseña. Verificá que sigan vinculados a esta propiedad.");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          ...pageShellStyle,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#6e6e73", fontSize: 14 }}>Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{
          ...pageShellStyle,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#6e6e73", fontSize: 14 }}>Perfil no encontrado.</div>
      </div>
    );
  }

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Usuario";

  const avatarUrl = resolveMediaUrl(profile.avatar_url);
  const memberSince = profile.member_since
    ? new Date(profile.member_since).toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
      })
    : null;

  const isOwnProfile = user?.id === userId;
  const isLoggedIn = Boolean(user);

  const activeProperties = profile.active_properties ?? 0;

  return (
    <div style={pageShellStyle}>
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
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

        <div style={{ width: 70 }} />
      </div>

      {/* Content */}
      <div
        style={{
          ...pageScrollStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 20px 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            gap: 16,
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
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 80,
                background: colors.heroGradient,
                opacity: 0.08,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `3px solid ${colors.primary}`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: colors.lightBg,
                        border: `3px solid ${colors.primary}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{ fontSize: 32, fontWeight: 700, color: colors.primary }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
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
                </div>

                {/* Name + role + rating */}
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
                    {displayName}
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
                    <RoleIcon role={profile.role} />
                    <span
                      style={{ fontSize: 12, fontWeight: 600, color: colors.primary }}
                    >
                      {roleLabelFromCode(profile.role)}
                    </span>
                  </div>

                  {/* Reputation */}
                  <div style={{ marginTop: 10 }}>
                    {profile.total_reviews > 0 ? (
                      <StarRating
                        rating={profile.average_rating}
                        totalReviews={profile.total_reviews}
                        size={14}
                      />
                    ) : (
                      <span
                        style={{
                          display: "inline-block",
                          background: "#f0f0f5",
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#6e6e73",
                          fontWeight: 500,
                        }}
                      >
                        ✨ Nuevo en Propie
                      </span>
                    )}
                  </div>

                  {/* Review CTA */}
                  {!isOwnProfile && isLoggedIn && (
                    <div style={{ marginTop: 12 }}>
                      {canReview ? (
                        <button
                          type="button"
                          onClick={() => setShowReviewModal(true)}
                          style={{
                            background: colors.primary,
                            border: "none",
                            borderRadius: 12,
                            padding: "10px 14px",
                            color: "white",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <Star size={14} fill="white" />
                          Calificar experiencia
                        </button>
                      ) : (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#f5f5f7",
                            padding: "8px 12px",
                            borderRadius: 10,
                            fontSize: 12,
                            color: canReviewReason === "ALREADY_REVIEWED" ? "#10b981" : "#9a9aa0",
                          }}
                        >
                          <Info size={13} />
                          {canReviewReason === "ALREADY_REVIEWED"
                            ? "Ya calificaste a esta persona"
                            : "Disponible cuando trabajen juntos"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio + details */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}
              >
                {profile.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MapPin size={16} color="#6e6e73" />
                    <span style={{ fontSize: 14, color: "#3a3a3c" }}>{profile.location}</span>
                  </div>
                )}
                {memberSince && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Calendar size={16} color="#6e6e73" />
                    <span style={{ fontSize: 14, color: "#6e6e73" }}>
                      Miembro desde {memberSince}
                    </span>
                  </div>
                )}
                {activeProperties > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Briefcase size={16} color="#6e6e73" />
                    <span style={{ fontSize: 14, color: "#3a3a3c" }}>
                      {activeProperties}{" "}
                      {activeProperties === 1 ? "propiedad publicada" : "propiedades publicadas"}
                    </span>
                  </div>
                )}
              </div>

              {profile.bio && (
                <p
                  style={{
                    margin: "16px 0 0",
                    fontSize: 14,
                    color: "#3a3a3c",
                    lineHeight: 1.65,
                    padding: "14px",
                    background: "#f5f5f7",
                    borderRadius: 12,
                  }}
                >
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {userId && profile.role === "OWNER" && (
            <ProfilePropertiesList
              title="Propiedades publicadas"
              userId={userId}
              variant="owner"
              backTo={`/perfil/${userId}`}
            />
          )}

          {/* Reviews section */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "20px",
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
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Reseñas
              </h3>
              {profile.total_reviews > 0 && (
                <StarRating
                  rating={profile.average_rating}
                  totalReviews={profile.total_reviews}
                  size={13}
                  compact
                />
              )}
            </div>

            {reviewsLoading && reviews.length === 0 ? (
              <div style={{ padding: 22, color: "#6e6e73", fontSize: 14, textAlign: "center" }}>
                Cargando reseñas...
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 16px" }}>
                <TrendingUp size={36} color="#d1d1d6" style={{ margin: "0 auto 10px" }} />
                <p
                  style={{ margin: 0, fontSize: 13, color: "#9a9aa0", lineHeight: 1.5 }}
                >
                  Este usuario todavía no tiene reseñas.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reviews.map((review) => {
                  const name =
                    [review.reviewer_first_name, review.reviewer_last_name]
                      .filter(Boolean)
                      .join(" ") || "Usuario";
                  const date = new Date(review.created_at).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={review.id}
                      style={{ background: "#f5f5f7", borderRadius: 14, padding: "14px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                            {name}
                          </div>
                          <div style={{ fontSize: 11, color: "#9a9aa0" }}>{date}</div>
                        </div>
                        <div style={{ display: "flex", gap: 2 }}>
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
                    </div>
                  );
                })}

                {hasMoreReviews && (
                  <button
                    type="button"
                    onClick={loadMoreReviews}
                    disabled={reviewsLoading}
                    style={{
                      width: "100%",
                      background: "none",
                      border: `1.5px solid ${colors.primary}30`,
                      borderRadius: 12,
                      padding: "11px",
                      color: colors.primary,
                      fontSize: 13,
                      fontWeight: 700,
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
        </div>
      </div>

      {/* Review modal */}
      {showReviewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setShowReviewModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "white",
              borderRadius: 20,
              padding: 22,
              boxShadow: "0 22px 60px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 19,
                    fontWeight: 800,
                    color: "#1a1a1a",
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Calificar experiencia
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6e6e73" }}>
                  con {displayName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: "#f5f5f7",
                  border: "none",
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X size={18} color="#1a1a1a" />
              </button>
            </div>

            {/* Property selector if multiple reviewable properties */}
            {reviewableProperties.length > 1 && (
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{ fontSize: 12, fontWeight: 600, color: "#6e6e73", marginBottom: 6, display: "block" }}
                >
                  Propiedad
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1.5px solid #e5e5ea",
                    fontSize: 14,
                    color: "#1a1a1a",
                    background: "white",
                    outline: "none",
                  }}
                >
                  {reviewableProperties.map((p) => (
                    <option key={p.property_id} value={p.property_id}>
                      {p.property_title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stars */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                padding: "12px 0 16px",
              }}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setReviewRating(value)}
                  aria-label={`${value} estrellas`}
                  style={{
                    width: 44,
                    height: 44,
                    border: "none",
                    borderRadius: 12,
                    background: value <= reviewRating ? "#fff7ed" : "#f5f5f7",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Star
                    size={25}
                    color="#f59e0b"
                    fill={value <= reviewRating ? "#f59e0b" : "none"}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Contá cómo fue trabajar con esta persona..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1.5px solid #e5e5ea",
                borderRadius: 14,
                padding: "13px 14px",
                fontSize: 14,
                color: "#1a1a1a",
                lineHeight: 1.5,
                resize: "none",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            />

            {reviewError && (
              <p style={{ margin: "10px 0 0", color: "#ef4444", fontSize: 12 }}>
                {reviewError}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || submittingReview}
              style={{
                width: "100%",
                marginTop: 14,
                background:
                  reviewRating > 0 && !submittingReview ? colors.primary : "#e5e5ea",
                border: "none",
                borderRadius: 14,
                padding: "14px",
                color: reviewRating > 0 && !submittingReview ? "white" : "#9a9aa0",
                fontSize: 15,
                fontWeight: 800,
                cursor:
                  reviewRating > 0 && !submittingReview ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Send size={16} />
              {submittingReview ? "Publicando..." : "Publicar reseña"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
