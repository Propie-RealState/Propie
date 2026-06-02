import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  ChevronRight,
  Clock,
  UserCheck,
} from "lucide-react";

import { useAppTheme } from "../../../../theme/useAppTheme";
import { useAuth } from "../../../../context/AuthContext";
import { isClientRole } from "../../../../lib/roles";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { NotificationsBell } from "../../../components/navigation/NotificationsBell";
import { apiFetch } from "../../../../lib/api";
import {
  getOwnerAgentApplications,
  type OwnerAgentApplication,
} from "../services/agent-applications.service";

function getAgentName(application: OwnerAgentApplication) {
  return (
    `${application.agent_first_name ?? ""} ${
      application.agent_last_name ?? ""
    }`.trim() || application.agent_email
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const colors = useAppTheme();
  const { user } = useAuth();
  const isClient = isClientRole(user?.role);
  const [applications, setApplications] = useState<OwnerAgentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        if (isClient) {
          await apiFetch("/notifications");
          setApplications([]);
          return;
        }

        const data = await getOwnerAgentApplications();
        setApplications(data);
      } catch (error) {
        console.error("Error loading notifications", error);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [isClient]);

  const pendingApplications = useMemo(
    () =>
      applications.filter((application) => application.status === "PENDING"),
    [applications],
  );

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
            }}
          >
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
              {isClient
                ? "Mensajes, bajas de precio y novedades de tus favoritos."
                : "Solicitudes, actividad y avisos importantes de tus propiedades."}
            </p>
          </div>

          <section
            style={{
              background: "white",
              borderRadius: 20,
              border: "1.5px solid #e5e5ea",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 18px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: colors.lightBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Briefcase size={19} color={colors.primary} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#1a1a1a",
                    }}
                  >
                    Solicitudes de agentes
                  </h3>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "#6e6e73",
                    }}
                  >
                    {pendingApplications.length} pendiente
                    {pendingApplications.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {pendingApplications.length > 0 && (
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
                  {pendingApplications.length}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ padding: 22, color: "#6e6e73", fontSize: 14 }}>
                Cargando notificaciones...
              </div>
            ) : pendingApplications.length === 0 ? (
              <div style={{ padding: 22, color: "#6e6e73", fontSize: 14 }}>
                No hay solicitudes pendientes por ahora.
              </div>
            ) : (
              pendingApplications.map((application) => {
                const agentName = getAgentName(application);
                return (
                  <div
                    key={application.id}
                    style={{
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    {/* Main row: navigate to messages */}
                    <button
                      onClick={() => navigate("/mensajes")}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "white",
                        padding: "16px 18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: colors.lightBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {application.agent_avatar_url ? (
                          <img
                            src={application.agent_avatar_url}
                            alt={agentName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: colors.primary,
                            }}
                          >
                            {agentName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "#1a1a1a",
                            marginBottom: 3,
                          }}
                        >
                          {agentName} envió una solicitud
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#6e6e73",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {application.property_title || "Propiedad sin título"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            color: "#9a9aa0",
                            fontSize: 12,
                            marginTop: 6,
                          }}
                        >
                          <Clock size={13} />
                          {new Date(application.created_at).toLocaleString(
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

                      <ChevronRight size={20} color="#9a9aa0" />
                    </button>

                    {/* Ver perfil link */}
                    <button
                      onClick={() =>
                        navigate(`/agentes/${application.agent_id}`, {
                          state: {
                            reviewPropertyId: application.property_id,
                            reviewPropertyTitle: application.property_title,
                            canCreateReview: application.status === "ACCEPTED",
                          },
                        })
                      }
                      style={{
                        width: "100%",
                        border: "none",
                        background: "none",
                        padding: "8px 18px 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: colors.primary,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <UserCheck size={13} />
                      Ver perfil de {agentName}
                    </button>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>

      <AppFooterNav />
    </div>
  );
}
