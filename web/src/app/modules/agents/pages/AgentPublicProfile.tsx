import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Home,
  Info,
  MapPin,
  Calendar,
  Shield,
  Star,
  TrendingUp,
  Send,
  X,
} from "lucide-react";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { useAuth } from "../../../../context/AuthContext";
import { StarRating } from "../../../components/StarRating";
import { useAgentReviews } from "../hooks/useAgentReviews";
import {
  checkCanReview,
  createUserReview,
  getAgentPublicProfile,
  type AgentPublicProfile as AgentProfile,
} from "../services/agents.service";
import { resolveMediaUrl } from "../../../../lib/api-base";

type AgentProfileLocationState = {
  reviewPropertyId?: string;
  reviewPropertyTitle?: string | null;
};

export default function AgentPublicProfile() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const reviewContext = (location.state as AgentProfileLocationState | null) ?? {};
  const { user } = useAuth();
  const colors = useAppTheme();

  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [canReviewReason, setCanReviewReason] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewPropertyId, setReviewPropertyId] = useState(
    reviewContext.reviewPropertyId ?? "",
  );
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const { reviews, loading: reviewsLoading, hasMore, loadMore, refresh } =
    useAgentReviews(agentId, 3);

  useEffect(() => {
    if (!agentId) return;
    getAgentPublicProfile(agentId).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [agentId]);

  useEffect(() => {
    if (!agentId || !user || user.id === agentId) return;
    checkCanReview(agentId, reviewContext.reviewPropertyId).then((result) => {
      setCanReview(result.canReview);
      setCanReviewReason(result.reason);
      if (result.reviewableProperties.length > 0 && !reviewPropertyId) {
        setReviewPropertyId(result.reviewableProperties[0].property_id);
      }
    });
  }, [agentId, user?.id, reviewContext.reviewPropertyId]);

  const agentName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Agente";

  const memberSince = profile?.member_since
    ? new Date(profile.member_since).toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
      })
    : null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f7",
          fontFamily: "'Inter', sans-serif",
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
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f7",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ color: "#6e6e73", fontSize: 14 }}>Perfil no encontrado.</div>
      </div>
    );
  }

  const avatarUrl = resolveMediaUrl(profile.avatar_url);
  const isOwnProfile = user?.id === agentId;

  async function handleSubmitReview() {
    if (!agentId || !reviewPropertyId || reviewRating === 0) return;

    try {
      setSubmittingReview(true);
      setReviewError(null);
      await createUserReview({
        targetUserId: agentId,
        propertyId: reviewPropertyId,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment("");
      setCanReview(false);
      setCanReviewReason("ALREADY_REVIEWED");
      await getAgentPublicProfile(agentId).then((data) => setProfile(data));
      refresh();
    } catch {
      setReviewError("No pudimos publicar la reseña. Verificá que sigas vinculado a esta propiedad.");
    } finally {
      setSubmittingReview(false);
    }
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
          Perfil del agente
        </h1>

        <div style={{ width: 70 }} />
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
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={agentName}
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
                        style={{
                          fontSize: 32,
                          fontWeight: 700,
                          color: colors.primary,
                        }}
                      >
                        {agentName.charAt(0).toUpperCase()}
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
                    {agentName}
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
                      Agente
                    </span>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <StarRating
                      rating={profile.average_rating}
                      totalReviews={profile.total_reviews}
                      size={14}
                    />
                  </div>

                  {!isOwnProfile && user && (
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
                            ? "Ya calificaste a este agente"
                            : "Disponible cuando trabajen juntos"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Meta info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 20,
                }}
              >
                {profile.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <MapPin size={16} color="#6e6e73" />
                    <span style={{ fontSize: 14, color: "#3a3a3c" }}>
                      {profile.location}
                    </span>
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

          {/* Stats */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
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
              Estadísticas
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "14px 8px",
                  background: "#f5f5f7",
                  borderRadius: 14,
                }}
              >
                <Home
                  size={20}
                  color={colors.primary}
                  style={{ margin: "0 auto 6px" }}
                />
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                  {profile.total_worked_properties}
                </div>
                <div style={{ fontSize: 10, color: "#6e6e73", marginTop: 3 }}>
                  Trabajadas
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  padding: "14px 8px",
                  background: "#f5f5f7",
                  borderRadius: 14,
                }}
              >
                <Briefcase
                  size={20}
                  color={colors.primary}
                  style={{ margin: "0 auto 6px" }}
                />
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                  {profile.completed_properties}
                </div>
                <div style={{ fontSize: 10, color: "#6e6e73", marginTop: 3 }}>
                  Cerradas
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  padding: "14px 8px",
                  background: "#f5f5f7",
                  borderRadius: 14,
                }}
              >
                <Star
                  size={20}
                  color="#f59e0b"
                  fill={profile.average_rating > 0 ? "#f59e0b" : "none"}
                  style={{ margin: "0 auto 6px" }}
                />
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                  {profile.average_rating > 0
                    ? profile.average_rating.toFixed(1)
                    : "—"}
                </div>
                <div style={{ fontSize: 10, color: "#6e6e73", marginTop: 3 }}>
                  Reputación
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
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
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "#f5f5f7",
                      borderRadius: 12,
                      padding: "14px",
                      opacity: 1 - i * 0.2,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "#e5e5ea",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            height: 11,
                            background: "#e5e5ea",
                            borderRadius: 6,
                            width: "55%",
                            marginBottom: 6,
                          }}
                        />
                        <div
                          style={{
                            height: 9,
                            background: "#e5e5ea",
                            borderRadius: 6,
                            width: "35%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 16px" }}>
                <TrendingUp
                  size={36}
                  color="#d1d1d6"
                  style={{ margin: "0 auto 10px" }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#9a9aa0",
                    lineHeight: 1.5,
                  }}
                >
                  Este agente todavía no tiene reseñas.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reviews.map((review) => {
                  const name =
                    [review.reviewer_first_name, review.reviewer_last_name]
                      .filter(Boolean)
                      .join(" ") || "Usuario";
                  const avatar = review.reviewer_avatar_url
                    ? resolveMediaUrl(review.reviewer_avatar_url)
                    : null;
                  const date = new Date(review.created_at).toLocaleDateString(
                    "es-AR",
                    { day: "numeric", month: "short", year: "numeric" },
                  );

                  return (
                    <div
                      key={review.id}
                      style={{
                        background: "#f5f5f7",
                        borderRadius: 14,
                        padding: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          marginBottom: review.comment ? 10 : 0,
                        }}
                      >
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 38,
                              height: 38,
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
                                fontSize: 15,
                                fontWeight: 700,
                                color: colors.primary,
                              }}
                            >
                              {name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1a1a1a",
                              }}
                            >
                              {name}
                            </span>
                            <span style={{ fontSize: 11, color: "#9a9aa0" }}>
                              {date}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                size={11}
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
                          <Home size={10} color={colors.primary} />
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
                      padding: "11px",
                      color: colors.primary,
                      fontSize: 13,
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
        </div>
      </div>

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
            onClick={(event) => event.stopPropagation()}
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
                  Calificar a {agentName}
                </h3>
                {(reviewContext.reviewPropertyTitle || reviewPropertyId) && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6e6e73" }}>
                    {reviewContext.reviewPropertyTitle ?? ""}
                  </p>
                )}
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
                    background:
                      value <= reviewRating ? "#fff7ed" : "#f5f5f7",
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
              onChange={(event) => setReviewComment(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Contá cómo fue trabajar con este agente..."
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
                  reviewRating > 0 && !submittingReview
                    ? colors.primary
                    : "#e5e5ea",
                border: "none",
                borderRadius: 14,
                padding: "14px",
                color:
                  reviewRating > 0 && !submittingReview ? "white" : "#9a9aa0",
                fontSize: 15,
                fontWeight: 800,
                cursor:
                  reviewRating > 0 && !submittingReview
                    ? "pointer"
                    : "not-allowed",
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
