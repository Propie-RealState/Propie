import { useLocation } from "react-router-dom";

const PUBLISH_STEP_BY_PATH: Record<string, number> = {
  publicar: 1,
  "fotos-videos": 2,
  informacion: 3,
  comercializacion: 4,
  revision: 5,
};

const PUBLISH_STEP_TOTAL = 5;

export function PublishWizardProgress() {
  const location = useLocation();
  const segment = location.pathname.split("/").filter(Boolean).pop() ?? "publicar";
  const current = PUBLISH_STEP_BY_PATH[segment] ?? 1;
  const progress = (current / PUBLISH_STEP_TOTAL) * 100;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        padding: "0 28px 4px",
        boxSizing: "border-box",
      }}
      aria-label={`Paso ${current} de ${PUBLISH_STEP_TOTAL}`}
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
          Paso {current} de {PUBLISH_STEP_TOTAL}
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
