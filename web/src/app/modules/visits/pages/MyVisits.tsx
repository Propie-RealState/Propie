import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { useAppTheme } from "../../../../theme/useAppTheme";
import { getUserPublicProfile } from "../../agents/services/agents.service";
import { getPropertyById } from "../../explore/services/property-details.service";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { NotificationsBell } from "../../../components/navigation/NotificationsBell";
import { VisitCard } from "../components/VisitCard";
import { WeeklyCalendarView } from "../components/WeeklyCalendarView";
import { listVisits } from "../services/visits.service";
import type {
  Visit,
  VisitDisplayInfo,
  VisitListSegment,
} from "../types/visit.types";
import { formatUserName, getWeekRange } from "../utils/visit-ui";
import { pageShellStyle } from "../../../components/layout/layout-styles";

type SegmentOption = {
  id: VisitListSegment;
  label: string;
};

const SEGMENTS: SegmentOption[] = [
  { id: "today", label: "Hoy" },
  { id: "upcoming", label: "Próximas" },
  { id: "calendar", label: "Calendario" },
];

async function enrichVisits(visits: Visit[]) {
  const displayByVisitId: Record<string, VisitDisplayInfo> = {};
  const propertyCache = new Map<string, Awaited<ReturnType<typeof getPropertyById>>>();
  const userCache = new Map<
    string,
    Awaited<ReturnType<typeof getUserPublicProfile>>
  >();

  async function loadProperty(propertyId: string) {
    if (!propertyCache.has(propertyId)) {
      try {
        propertyCache.set(propertyId, await getPropertyById(propertyId));
      } catch {
        propertyCache.set(propertyId, null);
      }
    }

    return propertyCache.get(propertyId);
  }

  async function loadUser(userId: string) {
    if (!userCache.has(userId)) {
      userCache.set(userId, await getUserPublicProfile(userId));
    }

    return userCache.get(userId);
  }

  await Promise.all(
    visits.map(async (visit) => {
      const [property, client, agent] = await Promise.all([
        loadProperty(visit.propertyId),
        loadUser(visit.clientId),
        visit.agentId ? loadUser(visit.agentId) : Promise.resolve(null),
      ]);

      displayByVisitId[visit.id] = {
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
      };
    }),
  );

  return displayByVisitId;
}

export default function MyVisits() {
  const navigate = useNavigate();
  const colors = useAppTheme();

  const [segment, setSegment] = useState<VisitListSegment>("upcoming");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [displayByVisitId, setDisplayByVisitId] = useState<
    Record<string, VisitDisplayInfo>
  >({});
  const [loading, setLoading] = useState(true);
  const [weekReference, setWeekReference] = useState(new Date());

  const loadVisits = useCallback(async () => {
    try {
      setLoading(true);

      const params: {
        segment: VisitListSegment;
        from?: string;
        to?: string;
      } = { segment };

      if (segment === "calendar") {
        const { start, end } = getWeekRange(weekReference);
        params.from = start.toISOString();
        params.to = end.toISOString();
      }

      const data = await listVisits(params);
      setVisits(data);

      const display = await enrichVisits(data);
      setDisplayByVisitId(display);
    } catch (error) {
      console.error("Error loading visits", error);
      setVisits([]);
      setDisplayByVisitId({});
    } finally {
      setLoading(false);
    }
  }, [segment, weekReference]);

  useEffect(() => {
    void loadVisits();
  }, [loadVisits]);

  const emptyMessage = useMemo(() => {
    switch (segment) {
      case "today":
        return "No tenés visitas programadas para hoy.";
      case "calendar":
        return "No hay visitas en esta semana.";
      default:
        return "No tenés visitas próximas.";
    }
  }, [segment]);

  return (
    <div style={{ ...pageShellStyle, background: "#f5f5f7" }}>
      <div
        style={{
          flexShrink: 0,
          background: "white",
          borderBottom: "1px solid #f0f0f0",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#1a1a1a",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
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
          Visitas
        </h1>

        <NotificationsBell />
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "12px 16px 0",
          background: "#f5f5f7",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "#e5e5ea",
            borderRadius: 12,
            padding: 4,
          }}
        >
          {SEGMENTS.map((option) => {
            const active = segment === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSegment(option.id)}
                style={{
                  flex: 1,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 8px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: active ? "white" : "transparent",
                  color: active ? colors.primary : "#6e6e73",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          paddingBottom: 96,
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#6e6e73",
              padding: 32,
              fontSize: 14,
            }}
          >
            Cargando visitas...
          </div>
        ) : visits.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "white",
              borderRadius: 20,
              border: "1.5px solid #e5e5ea",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `${colors.primary}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CalendarDays size={28} color={colors.primary} />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: "#1a1a1a",
              }}
            >
              {emptyMessage}
            </p>
          </div>
        ) : segment === "calendar" ? (
          <WeeklyCalendarView
            weekReference={weekReference}
            visits={visits}
            displayByVisitId={displayByVisitId}
            primaryColor={colors.primary}
            onWeekChange={setWeekReference}
            onVisitClick={(visitId) => navigate(`/visitas/${visitId}`)}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                display={
                  displayByVisitId[visit.id] ?? {
                    propertyTitle: "Propiedad",
                    clientName: "Cliente",
                    agentName: null,
                    ownerName: null,
                  }
                }
                primaryColor={colors.primary}
                onClick={() => navigate(`/visitas/${visit.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <AppFooterNav />
    </div>
  );
}
