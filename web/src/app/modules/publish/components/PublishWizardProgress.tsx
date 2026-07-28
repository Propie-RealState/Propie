import { useLocation } from "react-router-dom";

import { useAuth } from "../../../../context/AuthContext";
import { useIsAgent } from "../../../../theme/useAppTheme";
import { getPublishWizardProgress } from "../publish-wizard-steps";

export function PublishWizardProgress() {
  const location = useLocation();
  const { isHydrating } = useAuth();
  const isAgent = useIsAgent();
  const { current, total, progress } = getPublishWizardProgress(
    location.pathname,
    isAgent,
  );

  if (isHydrating) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        padding: "0 28px 4px",
        boxSizing: "border-box",
      }}
      aria-label={`Paso ${current} de ${total}`}
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
          Paso {current} de {total}
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
