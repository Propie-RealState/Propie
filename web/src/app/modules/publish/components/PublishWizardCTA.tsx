import React from "react";

import { useAppTheme } from "../../../../theme/useAppTheme";

type PublishWizardCTAProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
  large?: boolean;
};

export function PublishWizardCTA({
  label,
  onClick,
  disabled = false,
  loading = false,
  hint,
  large = false,
}: PublishWizardCTAProps) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;

  return (
    <>
      {hint ? (
        <p
          className="publish-wizard-shell__footer-hint"
          role="status"
          style={{
            margin: "0 0 10px",
            fontSize: 13,
            lineHeight: 1.45,
            color: "#9a3412",
            fontWeight: 500,
          }}
        >
          {hint}
        </p>
      ) : null}
      <button
        type="button"
        data-testid="publish-wizard-cta"
        disabled={isDisabled}
        onClick={onClick}
        style={{
          width: "100%",
          minHeight: large ? 56 : 52,
          background: isDisabled ? "#e5e5ea" : theme.primary,
          border: "none",
          borderRadius: large ? 18 : 16,
          padding: large ? "16px 18px" : "15px 18px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          fontSize: large ? 18 : 16,
          fontWeight: 700,
          color: isDisabled ? "#9a9aa0" : "white",
          transition: "all 0.18s ease",
          boxShadow: isDisabled ? "none" : "0 4px 16px rgba(68, 23, 230, 0.24)",
        }}
      >
        {loading ? "Guardando..." : label}
      </button>
    </>
  );
}
