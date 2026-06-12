import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { createVisit, rescheduleVisit } from "../services/visits.service";
import type { Visit } from "../types/visit.types";
import { toIsoDateTime } from "../utils/visit-ui";

type ScheduleVisitSheetProps = {
  open: boolean;
  conversationId: string;
  visit?: Visit | null;
  primaryColor: string;
  onClose: () => void;
  onSuccess: () => void;
};

function defaultDateValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export function ScheduleVisitSheet({
  open,
  conversationId,
  visit,
  primaryColor,
  onClose,
  onSuccess,
}: ScheduleVisitSheetProps) {
  const isReschedule = Boolean(visit);
  const [date, setDate] = useState(defaultDateValue());
  const [time, setTime] = useState("10:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (visit) {
      const scheduled = new Date(visit.scheduledAt);
      setDate(scheduled.toISOString().slice(0, 10));
      setTime(
        `${String(scheduled.getHours()).padStart(2, "0")}:${String(scheduled.getMinutes()).padStart(2, "0")}`,
      );
      setDurationMinutes(visit.durationMinutes);
      setNotes(visit.notes ?? "");
    } else {
      setDate(defaultDateValue());
      setTime("10:00");
      setDurationMinutes(30);
      setNotes("");
    }

    setError(null);
  }, [open, visit]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError(null);

      const scheduledAt = toIsoDateTime(date, time);
      const scheduledMs = new Date(scheduledAt).getTime();

      if (Number.isNaN(scheduledMs) || scheduledMs <= Date.now()) {
        setError("Elegí una fecha y hora futuras.");
        return;
      }

      if (isReschedule && visit) {
        await rescheduleVisit(visit.id, {
          scheduledAt,
          durationMinutes,
          notes: notes.trim() || undefined,
        });
      } else {
        await createVisit({
          conversationId,
          scheduledAt,
          durationMinutes,
          notes: notes.trim() || undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (submitError) {
      console.error("Error scheduling visit", submitError);
      setError("No pudimos guardar la visita. Revisá los datos e intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        background: "rgba(0,0,0,0.45)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: "20px 16px 28px",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              color: "#1a1a1a",
            }}
          >
            {isReschedule ? "Reprogramar visita" : "Agendar visita"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f5f5f7",
              border: "none",
              borderRadius: 10,
              padding: 8,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6e6e73" }}>
              Fecha
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid #e5e5ea",
                fontSize: 14,
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6e6e73" }}>
              Hora
            </span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid #e5e5ea",
                fontSize: 14,
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6e6e73" }}>
              Duración (minutos)
            </span>
            <select
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(Number(event.target.value))
              }
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid #e5e5ea",
                fontSize: 14,
                background: "white",
              }}
            >
              {[15, 30, 45, 60, 90, 120].map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6e6e73" }}>
              Notas (opcional)
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Instrucciones o comentarios para la visita"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid #e5e5ea",
                fontSize: 14,
                resize: "vertical",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </label>

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: "#ef4444" }}>{error}</p>
          )}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            style={{
              marginTop: 4,
              background: submitting ? "#e5e5ea" : primaryColor,
              color: submitting ? "#9a9aa0" : "white",
              border: "none",
              borderRadius: 14,
              padding: "14px 16px",
              fontSize: 15,
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting
              ? "Guardando..."
              : isReschedule
                ? "Guardar cambios"
                : "Agendar visita"}
          </button>
        </div>
      </div>
    </div>
  );
}
