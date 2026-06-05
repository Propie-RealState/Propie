import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  TrendingDown,
} from "lucide-react";

import { useAppTheme } from "../../../../theme/useAppTheme";
import { emitPushEngagement } from "../../../../lib/push-notifications";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { NotificationsBell } from "../../../components/navigation/NotificationsBell";
import { useNotifications } from "../../notifications/hooks/useNotifications";

function NotificationIcon({
  type,
  color,
}: {
  type: string;
  color: string;
}) {
  switch (type) {
    case "NEW_PROPERTY_NEARBY":
    case "PROPERTY_PUBLISHED":
      return <MapPin size={19} color={color} />;
    case "PROPERTY_PRICE_CHANGED":
      return <TrendingDown size={19} color={color} />;
    case "PROPERTY_FAVORITE_UPDATED":
    case "PROPERTY_UPDATED":
      return <Heart size={19} color={color} />;
    case "AGENT_APPLICATION_RECEIVED":
    case "AGENT_APPLICATION_ACCEPTED":
    case "AGENT_APPLICATION_REJECTED":
      return <Briefcase size={19} color={color} />;
    case "MESSAGE_RECEIVED":
      return <MessageCircle size={19} color={color} />;
    default:
      return <Bell size={19} color={color} />;
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const colors = useAppTheme();
  const {
    items,
    loading,
    loadingMore,
    hasMore,
    markRead,
    markAllRead,
    loadMore,
    getRoute,
  } = useNotifications();

  useEffect(() => {
    emitPushEngagement();
  }, []);

  const unreadCount = items.filter((item) => !item.read).length;

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
          Notificaciones
        </h1>

        <NotificationsBell />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "22px 20px 40px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              border: "1.5px solid #e5e5ea",
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1a1a1a",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Centro de notificaciones
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                  color: "#6e6e73",
                  lineHeight: 1.5,
                }}
              >
                Propiedades cercanas, favoritos, mensajes y solicitudes.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  void markAllRead();
                }}
                style={{
                  border: "none",
                  background: colors.lightBg,
                  color: colors.primary,
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Marcar todas
              </button>
            )}
          </div>

          <section
            style={{
              background: "white",
              borderRadius: 20,
              border: "1.5px solid #e5e5ea",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div style={{ padding: 22, color: "#6e6e73", fontSize: 14 }}>
                Cargando notificaciones...
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  padding: "36px 22px",
                  textAlign: "center",
                  color: "#6e6e73",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: colors.lightBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <Bell size={24} color={colors.primary} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>
                  Sin novedades por ahora
                </div>
                <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                  Te avisamos cuando haya actividad relevante para vos.
                </div>
              </div>
            ) : (
              items.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (!notification.read) {
                      void markRead(notification.id);
                    }
                    navigate(getRoute(notification));
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    borderTop: "1px solid #f0f0f0",
                    background: notification.read ? "white" : "#faf9ff",
                    padding: "16px 18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: colors.lightBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <NotificationIcon
                      type={notification.type}
                      color={colors.primary}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "#1a1a1a",
                        }}
                      >
                        {notification.title}
                      </div>
                      {!notification.read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: colors.primary,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#6e6e73",
                        lineHeight: 1.45,
                      }}
                    >
                      {notification.body}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        color: "#9a9aa0",
                        fontSize: 12,
                        marginTop: 8,
                      }}
                    >
                      <Clock size={13} />
                      {new Date(notification.createdAt).toLocaleString(
                        "es-AR",
                        {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}

            {hasMore && !loading && (
              <div style={{ padding: 16, borderTop: "1px solid #f0f0f0" }}>
                <button
                  type="button"
                  onClick={() => {
                    void loadMore();
                  }}
                  disabled={loadingMore}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "#fafafa",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: colors.primary,
                    cursor: loadingMore ? "default" : "pointer",
                  }}
                >
                  {loadingMore ? "Cargando..." : "Cargar más"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      <AppFooterNav />
    </div>
  );
}
