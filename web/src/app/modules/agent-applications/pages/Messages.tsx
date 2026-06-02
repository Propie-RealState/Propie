import { useEffect, useMemo, useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Check,
  Clock,
  ExternalLink,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  UserCheck,
  X,
} from "lucide-react";

import { useAppTheme } from "../../../../theme/useAppTheme";
import { useAuth } from "../../../../context/AuthContext";
import { isClientRole } from "../../../../lib/roles";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { NotificationsBell } from "../../../components/navigation/NotificationsBell";
import {
  getOwnerAgentApplications,
  type OwnerAgentApplication,
  updateOwnerAgentApplicationStatus,
} from "../services/agent-applications.service";

function getAgentName(application: OwnerAgentApplication) {
  return (
    `${application.agent_first_name ?? ""} ${
      application.agent_last_name ?? ""
    }`.trim() || application.agent_email
  );
}

function getApplicationLocation(application: OwnerAgentApplication) {
  return [
    application.property_address,
    application.property_neighborhood,
    application.property_city,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function Messages() {
  const navigate = useNavigate();
  const colors = useAppTheme();
  const { user } = useAuth();
  const isClient = isClientRole(user?.role);
  const [applications, setApplications] = useState<OwnerAgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadApplications() {
    try {
      const data = await getOwnerAgentApplications();
      setApplications(data);
    } catch (error) {
      console.error("Error loading messages", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isClient) {
      setLoading(false);
      return;
    }

    loadApplications();
  }, [isClient]);

  const pendingCount = useMemo(
    () =>
      applications.filter((application) => application.status === "PENDING")
        .length,
    [applications],
  );

  async function handleStatus(
    applicationId: string,
    status: "ACCEPTED" | "REJECTED",
  ) {
    try {
      setUpdatingId(applicationId);
      await updateOwnerAgentApplicationStatus(applicationId, status);
      await loadApplications();
      window.dispatchEvent(new Event("agent-applications:changed"));
    } catch (error) {
      console.error("Error updating application", error);
      alert("No pudimos actualizar la solicitud.");
    } finally {
      setUpdatingId(null);
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
          Mensajes
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
          {isClient ? (
            <div
              style={{
                background: "white",
                borderRadius: 20,
                border: "1.5px solid #e5e5ea",
                padding: 28,
                textAlign: "center",
                color: "#6e6e73",
              }}
            >
              <MessageCircle
                size={32}
                color={colors.primary}
                style={{ marginBottom: 12 }}
              />
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
                Tus conversaciones con propietarios y agentes aparecerán acá
                cuando contactes una propiedad.
              </p>
            </div>
          ) : (
            <>
          <div
            style={{
              background: "white",
              borderRadius: 20,
              border: "1.5px solid #e5e5ea",
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: colors.lightBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={22} color={colors.primary} />
              </div>
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
                  Solicitudes de agentes
                </h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "#6e6e73",
                    lineHeight: 1.4,
                  }}
                >
                  {pendingCount > 0
                    ? `${pendingCount} pendiente${
                        pendingCount === 1 ? "" : "s"
                      } por responder`
                    : "No tenes solicitudes pendientes"}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 32, color: "#6e6e73" }}>
              Cargando mensajes...
            </div>
          ) : applications.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: 20,
                border: "1.5px solid #e5e5ea",
                padding: 28,
                textAlign: "center",
                color: "#6e6e73",
              }}
            >
              Todavia no recibiste solicitudes de agentes.
            </div>
          ) : (
            applications.map((application) => {
              const isPending = application.status === "PENDING";
              const agentName = getAgentName(application);
              const location = getApplicationLocation(application);

              return (
                <article
                  key={application.id}
                  style={{
                    background: "white",
                    borderRadius: 20,
                    border: isPending
                      ? `1.5px solid ${colors.primary}`
                      : "1.5px solid #e5e5ea",
                    padding: 20,
                    boxShadow: isPending
                      ? `0 10px 24px rgba(${colors.rgb}, 0.10)`
                      : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
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
                        <UserCheck size={24} color={colors.primary} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          marginBottom: 4,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#1a1a1a",
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
                          {agentName}
                        </h3>
                        <span
                          style={{
                            borderRadius: 999,
                            padding: "5px 9px",
                            fontSize: 11,
                            fontWeight: 800,
                            color: isPending ? "#92400e" : "#166534",
                            background: isPending ? "#fef3c7" : "#dcfce7",
                            flexShrink: 0,
                          }}
                        >
                          {application.status === "PENDING"
                            ? "Pendiente"
                            : application.status === "ACCEPTED"
                              ? "Aceptada"
                              : "Rechazada"}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: "#6e6e73",
                          lineHeight: 1.5,
                        }}
                      >
                        Quiere comercializar{" "}
                        <strong style={{ color: "#1a1a1a" }}>
                          {application.property_title || "tu propiedad"}
                        </strong>
                      </p>

                      {location && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#6e6e73",
                            fontSize: 12,
                            marginTop: 8,
                          }}
                        >
                          <MapPin size={14} />
                          <span>{location}</span>
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#9a9aa0",
                          fontSize: 12,
                          marginTop: 8,
                        }}
                      >
                        <Clock size={14} />
                        <span>
                          {new Date(application.created_at).toLocaleString(
                            "es-AR",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f5f5f7",
                      borderRadius: 14,
                      padding: 14,
                      marginTop: 16,
                      fontSize: 14,
                      color: "#1a1a1a",
                      lineHeight: 1.55,
                    }}
                  >
                    {application.message || "El agente no agrego un mensaje."}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 16,
                    }}
                  >
                    <Mail size={16} color="#6e6e73" />
                    <span style={{ fontSize: 13, color: "#6e6e73" }}>
                      {application.agent_email}
                    </span>
                  </div>

                  {/* Ver perfil del agente */}
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
                      marginTop: 14,
                      background: "#f5f5f7",
                      border: "none",
                      borderRadius: 12,
                      padding: "11px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                      color: colors.primary,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <UserCheck size={15} />
                    Ver perfil del agente
                    <ExternalLink size={13} />
                  </button>

                  {/* Accepted: link to the property */}
                  {application.status === "ACCEPTED" && application.property_id && (
                    <button
                      onClick={() =>
                        navigate(`/propiedad/${application.property_id}`)
                      }
                      style={{
                        width: "100%",
                        marginTop: 8,
                        background: colors.lightBg,
                        border: "none",
                        borderRadius: 12,
                        padding: "11px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        cursor: "pointer",
                        color: colors.primary,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      <Home size={15} />
                      Ver propiedad
                    </button>
                  )}

                  {isPending && (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 12,
                      }}
                    >
                      <button
                        onClick={() => handleStatus(application.id, "REJECTED")}
                        disabled={updatingId === application.id}
                        style={{
                          flex: 1,
                          background: "white",
                          border: "1.5px solid #fee2e2",
                          borderRadius: 14,
                          padding: "13px",
                          color: "#ef4444",
                          fontSize: 14,
                          fontWeight: 800,
                          cursor:
                            updatingId === application.id
                              ? "not-allowed"
                              : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <X size={16} />
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleStatus(application.id, "ACCEPTED")}
                        disabled={updatingId === application.id}
                        style={{
                          flex: 1,
                          background: colors.primary,
                          border: "none",
                          borderRadius: 14,
                          padding: "13px",
                          color: "white",
                          fontSize: 14,
                          fontWeight: 800,
                          cursor:
                            updatingId === application.id
                              ? "not-allowed"
                              : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          boxShadow: colors.buttonShadow,
                        }}
                      >
                        <Check size={16} />
                        Aceptar
                      </button>
                    </div>
                  )}
                </article>
              );
            })
          )}
            </>
          )}
        </div>
      </div>

      <AppFooterNav />
    </div>
  );
}
