import { useLocation } from "react-router-dom";

import { useRegisterOptional } from "../../../context/RegisterContext";
import { getRegisterStep } from "./register-steps";

export function RegisterProgress() {
  const location = useLocation();
  const register = useRegisterOptional();
  const step = getRegisterStep(location.pathname);

  if (!step) {
    return null;
  }

  const progress = (step.current / step.total) * 100;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        padding: "0 28px 4px",
        boxSizing: "border-box",
      }}
      aria-label={`Paso ${step.current} de ${step.total}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.72)",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          Paso {step.current} de {step.total}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {Math.round(progress)}%
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: "rgba(255,255,255,0.22)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 999,
            transition: "width 0.25s ease",
          }}
        />
      </div>
    </div>
  );
}
