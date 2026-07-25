import React from "react";
import { ChevronRight } from "lucide-react";
import { useAppTheme } from "../../../../theme/useAppTheme";

type SettingsMenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  comingSoon?: boolean;
};

export function SettingsMenuItem({
  icon,
  label,
  onClick,
  comingSoon = false,
}: SettingsMenuItemProps) {
  const colors = useAppTheme();
  const inactive = comingSoon || !onClick;

  return (
    <button
      type="button"
      onClick={
        inactive
          ? (e) => {
              e.preventDefault();
            }
          : onClick
      }
      aria-disabled={inactive || undefined}
      style={{
        width: "100%",
        background: "none",
        border: "none",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: inactive ? "not-allowed" : "pointer",
        borderRadius: 12,
        transition: "background 0.15s ease",
        opacity: inactive ? 0.55 : 1,
      }}
      onMouseEnter={(e) => {
        if (inactive) return;
        (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f7";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "none";
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${colors.primary}`;
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: colors.lightBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          flex: 1,
          textAlign: "left",
          fontSize: 15,
          fontWeight: 600,
          color: "#1a1a1a",
        }}
      >
        {label}
      </span>
      {comingSoon ? (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: "#6e6e73",
            background: "#f0f0f2",
            borderRadius: 999,
            padding: "4px 8px",
            flexShrink: 0,
          }}
        >
          Próximamente
        </span>
      ) : (
        <ChevronRight size={20} color="#9a9aa0" />
      )}
    </button>
  );
}
