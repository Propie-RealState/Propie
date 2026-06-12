import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  MapPin,
  User,
} from "lucide-react";

import { useAppTheme } from "../../../../theme/useAppTheme";
import { useAuth } from "../../../../context/AuthContext";
import { getUserPublicProfile } from "../../agents/services/agents.service";
import { getPropertyById } from "../../explore/services/property-details.service";
import { ScheduleVisitSheet } from "../components/ScheduleVisitSheet";
import { VisitStatusBadge } from "../components/VisitStatusBadge";
import {
  cancelVisit,
  completeVisit,
  confirmVisit,
  getVisit,
} from "../services/visits.service";
import type { Visit, VisitDisplayInfo } from "../types/visit.types";
import {
  buildVisitActivityTimeline,
  formatVisitDate,
  formatVisitTime,
  formatUserName,
  getVisitActions,
  getVisitEventLabel,
} from "../utils/visit-ui";
import { showToast } from "../../../../lib/toast";

export default function VisitDetails() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const colors = useAppTheme();
  const { user } = useAuth();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [display, setDisplay] = useState<VisitDisplayInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const loadVisit = useCallback(async () => {
    if (!visitId) {
      return;
    }

    try {
      setLoading(true);
      const data = await getVisit(visitId);
      setVisit(data);

      const [property, client, agent] = await Promise.all([
        getPropertyById(data.propertyId).catch(() => null),
        getUserPublicProfile(data.clientId),
        data.agentId ? getUserPublicProfile(data.agentId) : Promise.resolve(null),
      ]);

      setDisplay({
        propertyTitle: property?.title ?? "Propiedad",
        clientName: formatUserName(client?.first_name, client?.last_name),
        agentName: agent
          ? formatUserName(agent.first_name, agent.last_name)
          : null,
        ownerName: property?.ownerInfo
          ? formatUserName(
              property.ownerInfo.firstName,
              property.ownerInfo.lastName,
            )
          : null,
      });
    } catch (error) {
      console.error("Error loading visit", error);
      setVisit(null);
      setDisplay(null);
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  useEffect(() => {
    void loadVisit();
  }, [loadVisit]);

  const actions = visit
    ? getVisitActions(visit, user?.id, user?.role)
    : {
        canConfirm: false,
        canCancel: false,
        canReschedule: false,
        canComplete: false,
      };

  const activity = visit ? buildVisitActivityTimeline(visit) : [];

  async function runAction(action: () => Promise<unknown>) {
    try {
      setActing(true);
      await action();
      await loadVisit();
    } catch (error) {
      console.error("Visit action failed", error);
      showToast("No pudimos completar la acción. Intentá nuevamente.");
    } finally {
      setActing(false);
    }
  }

  function detailRow(icon: ReactNode, label: string, value: string) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "12px 0",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div style={{ color: "#9a9aa0", marginTop: 2 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#9a9aa0",
              marginBottom: 2,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1a1a1a",
              wordBreak: "break-word",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    );
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
          flexShrink: 0,
          background: "white",
          borderBottom: "1px solid #f0f0f0",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/visitas")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <h1
          style={{
            margin: 0,
            flex: 1,
            fontSize: 17,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Sora', sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Detalle de visita
        </h1>

        {visit && <VisitStatusBadge status={visit.status} />}
      </div>

      <div style={{ flex: 1, padding: 16, paddingBottom: 32 }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#6e6e73", padding: 32 }}>
            Cargando visita...
          </div>
        ) : !visit || !display ? (
          <div
            style={{
              textAlign: "center",
              padding: 32,
              background: "white",
              borderRadius: 20,
              border: "1.5px solid #e5e5ea",
            }}
          >
            <p style={{ margin: 0, color: "#6e6e73" }}>
              No encontramos esta visita.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                background: "white",
                borderRadius: 20,
                border: "1.5px solid #e5e5ea",
                padding: "8px 18px 4px",
                marginBottom: 16,
              }}
            >
              {detailRow(
                <MapPin size={18} />,
                "Propiedad",
                display.propertyTitle,
              )}
              {detailRow(
                <User size={18} />,
                "Cliente",
                display.clientName,
              )}
              {display.ownerName
                && detailRow(
                  <User size={18} />,
                  "Propietario",
                  display.ownerName,
                )}
              {display.agentName
                && detailRow(
                  <User size={18} />,
                  "Agente",
                  display.agentName,
                )}
              {detailRow(
                <Calendar size={18} />,
                "Fecha",
                formatVisitDate(visit.scheduledAt),
              )}
              {detailRow(
                <Clock size={18} />,
                "Hora",
                formatVisitTime(visit.scheduledAt),
              )}
              {detailRow(
                <Clock size={18} />,
                "Duración",
                `${visit.durationMinutes} min`,
              )}
              {visit.notes
                && detailRow(
                  <FileText size={18} />,
                  "Notas",
                  visit.notes,
                )}
            </div>

            {(actions.canConfirm
              || actions.canReschedule
              || actions.canCancel
              || actions.canComplete) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {actions.canConfirm && visit.status !== "CONFIRMED" && (
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() =>
                      void runAction(() => confirmVisit(visit.id))
                    }
                    style={{
                      background: colors.primary,
                      color: "white",
                      border: "none",
                      borderRadius: 14,
                      padding: "14px 16px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: acting ? "not-allowed" : "pointer",
                      opacity: acting ? 0.7 : 1,
                    }}
                  >
                    Confirmar visita
                  </button>
                )}

                {actions.canReschedule && (
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => setShowReschedule(true)}
                    style={{
                      background: "white",
                      color: colors.primary,
                      border: `1.5px solid ${colors.primary}`,
                      borderRadius: 14,
                      padding: "14px 16px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: acting ? "not-allowed" : "pointer",
                    }}
                  >
                    Reprogramar
                  </button>
                )}

                {actions.canComplete && (
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() =>
                      void runAction(() => completeVisit(visit.id))
                    }
                    style={{
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: 14,
                      padding: "14px 16px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: acting ? "not-allowed" : "pointer",
                      opacity: acting ? 0.7 : 1,
                    }}
                  >
                    Marcar completada
                  </button>
                )}

                {actions.canCancel && !showCancelPrompt && (
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => setShowCancelPrompt(true)}
                    style={{
                      background: "white",
                      color: "#ef4444",
                      border: "1.5px solid #fecaca",
                      borderRadius: 14,
                      padding: "14px 16px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: acting ? "not-allowed" : "pointer",
                    }}
                  >
                    Cancelar visita
                  </button>
                )}

                {showCancelPrompt && (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 16,
                      border: "1.5px solid #fecaca",
                      padding: 16,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1a1a1a",
                      }}
                    >
                      Motivo de cancelación (opcional)
                    </p>
                    <textarea
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                      rows={2}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1.5px solid #e5e5ea",
                        fontSize: 14,
                        marginBottom: 10,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCancelPrompt(false);
                          setCancelReason("");
                        }}
                        style={{
                          flex: 1,
                          background: "#f5f5f7",
                          border: "none",
                          borderRadius: 10,
                          padding: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Volver
                      </button>
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() =>
                          void runAction(() =>
                            cancelVisit(visit.id, {
                              reason: cancelReason.trim() || undefined,
                            }),
                          ).then(() => {
                            setShowCancelPrompt(false);
                            setCancelReason("");
                          })
                        }
                        style={{
                          flex: 1,
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          padding: "12px",
                          fontWeight: 700,
                          cursor: acting ? "not-allowed" : "pointer",
                        }}
                      >
                        Confirmar cancelación
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                background: "white",
                borderRadius: 20,
                border: "1.5px solid #e5e5ea",
                padding: 18,
              }}
            >
              <h2
                style={{
                  margin: "0 0 14px",
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "'Sora', sans-serif",
                  color: "#1a1a1a",
                }}
              >
                Historial
              </h2>

              {activity.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: "#9a9aa0" }}>
                  Sin actividad registrada.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {activity.map((item, index) => (
                    <div
                      key={`${item.eventType}-${item.at}-${index}`}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: colors.primary,
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1a1a1a",
                          }}
                        >
                          {item.label || getVisitEventLabel(item.eventType)}
                        </div>
                        <div style={{ fontSize: 12, color: "#9a9aa0" }}>
                          {formatVisitDate(item.at)} · {formatVisitTime(item.at)}
                        </div>
                        {item.detail && (
                          <div
                            style={{
                              fontSize: 13,
                              color: "#6e6e73",
                              marginTop: 4,
                            }}
                          >
                            {item.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {visit?.conversationId && (
        <ScheduleVisitSheet
          open={showReschedule}
          conversationId={visit.conversationId}
          visit={visit}
          primaryColor={colors.primary}
          onClose={() => setShowReschedule(false)}
          onSuccess={() => void loadVisit()}
        />
      )}
    </div>
  );
}
