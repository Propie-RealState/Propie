import { motion, AnimatePresence } from "motion/react";
import { Share, ArrowDown, X, Smartphone } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { PROPIE_THEME } from "@/theme/app-theme";

/**
 * Floating install banner for Android (native prompt) and
 * iOS (manual Share ? Add to Home Screen guide).
 *
 * Shows once per session. Dismissed via X button or by accepting.
 */
export function InstallBanner() {
  const { state, install, dismiss } = useInstallPrompt();

  return (
    <>
      {/* -- Android / Chrome banner -- */}
      <AnimatePresence>
        {state === "available" && (
          <motion.div
            key="android-banner"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            style={{
              position: "fixed",
              bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
              left: 12,
              right: 12,
              zIndex: 9999,
              borderRadius: 16,
              background: "#ffffff",
              boxShadow: "0 8px 32px rgba(68,23,230,0.18), 0 2px 8px rgba(0,0,0,0.08)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: PROPIE_THEME.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Smartphone size={22} color="#fff" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111" }}>
                Instalar Propie
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>
                Acceso rápido desde tu pantalla de inicio
              </p>
            </div>

            <button
              onClick={install}
              style={{
                flexShrink: 0,
                background: PROPIE_THEME.primary,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Instalar
            </button>

            <button
              onClick={dismiss}
              aria-label="Cerrar"
              style={{
                flexShrink: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "#999",
                display: "flex",
              }}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- iOS Safari bottom sheet -- */}
      <AnimatePresence>
        {state === "ios" && (
          <>
            {/* Backdrop */}
            <motion.div
              key="ios-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismiss}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                zIndex: 9998,
              }}
            />

            <motion.div
              key="ios-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                background: "#fff",
                borderRadius: "20px 20px 0 0",
                paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
                paddingTop: 20,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              {/* Drag handle */}
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: "#DDD",
                  margin: "0 auto 20px",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: PROPIE_THEME.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Smartphone size={24} color="#fff" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#111" }}>
                    Instalar Propie
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#666" }}>
                    Agrega la app a tu pantalla de inicio
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "#F5F5F7",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 12,
                }}
              >
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#111" }}>
                  Cómo instalar en iPhone / iPad:
                </p>

                {[
                  {
                    icon: <Share size={18} color={PROPIE_THEME.primary} />,
                    text: (
                      <>
                        Toca el botón{" "}
                        <strong>Compartir</strong>{" "}
                        <Share size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                        en la barra de Safari
                      </>
                    ),
                  },
                  {
                    icon: <ArrowDown size={18} color={PROPIE_THEME.primary} />,
                    text: (
                      <>
                        Desplázate y toca{" "}
                        <strong>"Agregar a pantalla de inicio"</strong>
                      </>
                    ),
                  },
                  {
                    icon: (
                      <span style={{ fontSize: 18 }}>?</span>
                    ),
                    text: <>Toca <strong>"Agregar"</strong> para confirmar</>,
                  },
                ].map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: i < 2 ? 10 : 0,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "#EEE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {step.icon}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.5 }}>
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={dismiss}
                style={{
                  width: "100%",
                  background: "#ECECEC",
                  color: "#333",
                  border: "none",
                  borderRadius: 12,
                  padding: "13px 0",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Ahora no
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
