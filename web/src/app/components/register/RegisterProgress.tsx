import { useLocation } from "react-router-dom";

import { useRegisterOptional } from "../../../context/RegisterContext";
import { isAgentRole } from "../../../lib/roles";
import { getRegisterStep } from "./register-steps";

export function RegisterProgress() {
  const location = useLocation();
  const register = useRegisterOptional();
  const step = getRegisterStep(location.pathname);

  if (!step) {
    return null;
  }

  const isAgent = isAgentRole(register?.data.role ?? null);
  const primary = isAgent ? "#C52E3E" : "#4417E6";
  const progress = (step.current / step.total) * 100;

  return (
    <div
      style={{
        padding: "12px 20px 0",
        background: "#f5f5f7",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6e6e73",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Paso {step.current} de {step.total}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: primary,
            }}
          >
            {Math.round(progress)}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: "#e5e5ea",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: primary,
              borderRadius: 999,
              transition: "width 0.25s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
