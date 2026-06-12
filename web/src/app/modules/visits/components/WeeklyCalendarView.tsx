import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Visit, VisitDisplayInfo } from "../types/visit.types";
import {
  formatVisitTime,
  getWeekDays,
  getWeekRange,
  isSameDay,
} from "../utils/visit-ui";

type WeeklyCalendarViewProps = {
  weekReference: Date;
  visits: Visit[];
  displayByVisitId: Record<string, VisitDisplayInfo>;
  primaryColor: string;
  onWeekChange: (next: Date) => void;
  onVisitClick: (visitId: string) => void;
};

export function WeeklyCalendarView({
  weekReference,
  visits,
  displayByVisitId,
  primaryColor,
  onWeekChange,
  onVisitClick,
}: WeeklyCalendarViewProps) {
  const { start, end } = getWeekRange(weekReference);
  const days = getWeekDays(weekReference);

  const weekLabel = `${start.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  })} – ${end.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  function shiftWeek(offset: number) {
    const next = new Date(weekReference);
    next.setDate(next.getDate() + offset * 7);
    onWeekChange(next);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => shiftWeek(-1)}
          style={{
            background: "white",
            border: "1.5px solid #e5e5ea",
            borderRadius: 10,
            padding: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {weekLabel}
        </span>

        <button
          type="button"
          onClick={() => shiftWeek(1)}
          style={{
            background: "white",
            border: "1.5px solid #e5e5ea",
            borderRadius: 10,
            padding: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {days.map((day) => {
          const dayVisits = visits.filter((visit) =>
            isSameDay(new Date(visit.scheduledAt), day),
          );
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              style={{
                background: "white",
                borderRadius: 16,
                border: isToday
                  ? `1.5px solid ${primaryColor}`
                  : "1.5px solid #e5e5ea",
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: dayVisits.length > 0 ? 10 : 0,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isToday ? primaryColor : "#1a1a1a",
                    textTransform: "capitalize",
                  }}
                >
                  {day.toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                {isToday && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: primaryColor,
                      background: `${primaryColor}14`,
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    Hoy
                  </span>
                )}
              </div>

              {dayVisits.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: "#9a9aa0" }}>
                  Sin visitas
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dayVisits.map((visit) => {
                    const display = displayByVisitId[visit.id];

                    return (
                      <button
                        key={visit.id}
                        type="button"
                        onClick={() => onVisitClick(visit.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: `${primaryColor}10`,
                          border: "none",
                          borderRadius: 10,
                          padding: "10px 12px",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1a1a1a",
                            marginBottom: 2,
                          }}
                        >
                          {formatVisitTime(visit.scheduledAt)}
                          {" · "}
                          {display?.propertyTitle ?? "Propiedad"}
                        </div>
                        {display?.clientName && (
                          <div style={{ fontSize: 12, color: "#6e6e73" }}>
                            {display.clientName}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
