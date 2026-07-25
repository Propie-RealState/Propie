import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  FileText,
  Globe,
  KeyRound,
  Shield,
  UserRound,
} from "lucide-react";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { getAppVersion } from "../../../../lib/app-version";
import {
  pageShellStyle,
  pageScrollStyle,
} from "../../../components/layout/layout-styles";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { SettingsMenuItem } from "../components/SettingsMenuItem";

function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      style={{
        margin: "0 0 8px 4px",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "#6e6e73",
      }}
    >
      {title}
    </h2>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #e5e5ea",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const colors = useAppTheme();
  const version = getAppVersion();

  return (
    <div style={pageShellStyle}>
      <div
        style={{
          flexShrink: 0,
          background: "white",
          borderBottom: "1px solid #e5e5ea",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#1a1a1a",
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 8,
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = `2px solid ${colors.primary}`;
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <h1
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Configuración
        </h1>

        <div style={{ width: 72 }} aria-hidden />
      </div>

      <div
        style={{
          ...pageScrollStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 20px calc(120px + env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.45,
              color: "#6e6e73",
            }}
          >
            Administrá tu cuenta y preferencias. Algunas opciones están en
            desarrollo y aparecerán pronto.
          </p>

          <section aria-labelledby="settings-account">
            <SectionHeading id="settings-account" title="Cuenta" />
            <SectionCard>
              <SettingsMenuItem
                icon={<UserRound size={20} color={colors.primary} />}
                label="Editar perfil"
                onClick={() => navigate("/perfil")}
              />
              <SettingsMenuItem
                icon={<KeyRound size={20} color={colors.primary} />}
                label="Cambiar contraseña"
                comingSoon
              />
            </SectionCard>
          </section>

          <section aria-labelledby="settings-preferences">
            <SectionHeading id="settings-preferences" title="Preferencias" />
            <SectionCard>
              <SettingsMenuItem
                icon={<Bell size={20} color={colors.primary} />}
                label="Notificaciones"
                onClick={() => navigate("/notificaciones")}
              />
              <SettingsMenuItem
                icon={<Globe size={20} color={colors.primary} />}
                label="Idioma"
                comingSoon
              />
            </SectionCard>
          </section>

          <section aria-labelledby="settings-legal">
            <SectionHeading id="settings-legal" title="Legal" />
            <SectionCard>
              <SettingsMenuItem
                icon={<FileText size={20} color={colors.primary} />}
                label="Términos y condiciones"
                comingSoon
              />
              <SettingsMenuItem
                icon={<Shield size={20} color={colors.primary} />}
                label="Política de privacidad"
                comingSoon
              />
            </SectionCard>
          </section>

          <section aria-labelledby="settings-about">
            <SectionHeading id="settings-about" title="Acerca de" />
            <div
              style={{
                background: "white",
                borderRadius: 16,
                border: "1px solid #e5e5ea",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Versión de la app
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#6e6e73",
                }}
              >
                {version}
              </span>
            </div>
          </section>
        </div>
      </div>

      <AppFooterNav />
    </div>
  );
}
