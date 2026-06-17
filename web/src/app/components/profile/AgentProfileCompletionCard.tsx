import React from "react";
import { useAppTheme } from "../../../theme/useAppTheme";
import type { AgentCompletionSummary } from "../../../lib/agent-profile-completion";

type Props = {
  summary: AgentCompletionSummary;
};

export function AgentProfileCompletionCard({ summary }: Props) {
  const theme = useAppTheme();
  return (
    <div
      data-testid="agent-profile-completion"
      style={{
        background: "white",
        borderRadius: 20,
        padding: "20px",
        border: "1.5px solid #e5e5ea",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
          Completitud del perfil
        </h3>
        <span
          data-testid="agent-profile-completion-percent"
          style={{ fontSize: 18, fontWeight: 800, color: theme.primary }}
        >
          {summary.percentage}%
        </span>
      </div>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "#6e6e73", lineHeight: 1.5 }}>
        Los agentes con perfiles profesionales completos reciben más solicitudes y generan más confianza.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {summary.items.map((item) => (
          <div
            key={item.id}
            data-testid={`agent-completion-item-${item.id}`}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
          >
            <span style={{ color: item.completed ? "#34C759" : "#9a9aa0", fontWeight: 700 }}>
              {item.completed ? "✓" : "○"}
            </span>
            <span style={{ color: item.completed ? "#1a1a1a" : "#6e6e73" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
