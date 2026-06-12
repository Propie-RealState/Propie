import { Calendar, ChevronRight, Clock, MapPin, User } from "lucide-react";

import type { Visit, VisitDisplayInfo } from "../types/visit.types";
import { formatVisitDate, formatVisitTime } from "../utils/visit-ui";
import { VisitStatusBadge } from "./VisitStatusBadge";

type VisitCardProps = {
  visit: Visit;
  display: VisitDisplayInfo;
  onClick: () => void;
  primaryColor: string;
};

export function VisitCard({
  visit,
  display,
  onClick,
  primaryColor,
}: VisitCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        background: "white",
        borderRadius: 20,
        border: "1.5px solid #e5e5ea",
        padding: 18,
        cursor: "pointer",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${primaryColor}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Calendar size={22} color={primaryColor} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "#1a1a1a",
              fontFamily: "'Sora', sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {display.propertyTitle}
          </h3>
          <VisitStatusBadge status={visit.status} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 13,
            color: "#6e6e73",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={14} />
            {formatVisitDate(visit.scheduledAt)} · {formatVisitTime(visit.scheduledAt)}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <User size={14} />
            Cliente: {display.clientName}
          </span>
          {display.agentName && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} />
              Agente: {display.agentName}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={20} color="#9a9aa0" style={{ flexShrink: 0 }} />
    </button>
  );
}
