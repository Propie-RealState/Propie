import React, {
  useEffect,
  useId,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

import {
  REGISTER_COMPLETION,
  type RegisterCompletionVariant,
} from "./registerCompletionTheme";

type Props = {
  open: boolean;

  variant: RegisterCompletionVariant;

  /** Título principal (ej. cuenta creada) */
  title: string;

  /** Línea secundaria */
  subtitle: string;

  /** ms antes de navegar; default 2400 */
  autoNavigateMs?: number;

  onFinish: () => void;
};

const STYLE_ID =
  "register-success-overlay-keyframes";

function ensureKeyframes() {
  if (
    typeof document ===
    "undefined"
  ) {
    return;
  }

  if (
    document.getElementById(
      STYLE_ID
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id = STYLE_ID;

  style.textContent = `
    @keyframes registerSuccessCheckPulse {
      0%, 100% {
        opacity: 0.35;
        transform: scale(0.88);
      }
      50% {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes registerSuccessBackdropIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes registerSuccessCardIn {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;

  document.head.append(
    style
  );
}

export function RegisterSuccessOverlay({
  open,
  variant,
  title,
  subtitle,
  autoNavigateMs = 2400,
  onFinish,
}: Props) {
  const theme =
    REGISTER_COMPLETION[
      variant
    ];

  const titleId =
    useId();

  const timerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const onFinishRef =
    useRef(onFinish);

  const hasFinishedRef =
    useRef(false);

  onFinishRef.current =
    onFinish;

  const complete = () => {
    if (hasFinishedRef.current) {
      return;
    }

    hasFinishedRef.current =
      true;

    if (timerRef.current) {
      clearTimeout(
        timerRef.current
      );

      timerRef.current =
        null;
    }

    onFinishRef.current();
  };

  useEffect(() => {
    ensureKeyframes();
  }, []);

  useEffect(() => {
    if (!open) {
      hasFinishedRef.current =
        false;

      return;
    }

    timerRef.current =
      setTimeout(
        () => {
          complete();
        },
        autoNavigateMs
      );

    return () => {
      if (
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current
        );
      }
    };
  }, [open, autoNavigateMs]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const prev =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        prev;
    };
  }, [open]);

  if (
    !open ||
    typeof document ===
      "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "rgba(15, 12, 28, 0.52)",
        backdropFilter:
          "blur(10px)",
        WebkitBackdropFilter:
          "blur(10px)",
        animation:
          "registerSuccessBackdropIn 0.35s ease-out forwards",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          borderRadius: 24,
          padding:
            "32px 28px 30px",
          background:
            theme.gradient,
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12) inset",
          textAlign: "center",
          fontFamily:
            "'Inter', sans-serif",
          animation:
            "registerSuccessCardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            margin:
              "0 auto 22px",
            borderRadius:
              "50%",
            border: `3px solid ${theme.ring}`,
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            background:
              "rgba(255,255,255,0.12)",
            boxShadow: `0 0 40px ${theme.checkGlow}`,
          }}
        >
          <Check
            size={44}
            strokeWidth={2.6}
            color="white"
            style={{
              animation:
                "registerSuccessCheckPulse 1.35s ease-in-out infinite",
            }}
          />
        </div>

        <h2
          id={titleId}
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: "white",
            letterSpacing:
              "-0.5px",
            fontFamily:
              "'Sora', sans-serif",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin:
              "12px 0 0",
            fontSize: 15,
            lineHeight: 1.55,
            color:
              "rgba(255,255,255,0.88)",
            fontWeight: 500,
          }}
        >
          {subtitle}
        </p>

        <p
          style={{
            margin:
              "22px 0 0",
            fontSize: 13,
            color:
              "rgba(255,255,255,0.65)",
            fontWeight: 500,
          }}
        >
          Te llevamos a explorar…
        </p>

        <button
          type="button"
          onClick={complete}
          style={{
            marginTop: 20,
            width: "100%",
            padding:
              "14px 18px",
            borderRadius: 14,
            border:
              "1px solid rgba(255,255,255,0.35)",
            background:
              "rgba(255,255,255,0.18)",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily:
              "'Inter', sans-serif",
          }}
        >
          Ir a explorar ahora
        </button>
      </div>
    </div>,

    document.body
  );
}
