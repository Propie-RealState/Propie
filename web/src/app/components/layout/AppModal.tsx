import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { modalBackdropStyle, modalPanelStyle } from "./layout-styles";

type AppModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  titleId?: string;
  maxWidth?: number;
  panelStyle?: React.CSSProperties;
};

export function AppModal({
  open,
  onClose,
  children,
  title,
  titleId,
  maxWidth = 480,
  panelStyle,
}: AppModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="app-modal-backdrop"
      style={modalBackdropStyle}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="app-modal-panel"
        style={{ ...modalPanelStyle, maxWidth, ...panelStyle }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {title ? (
          <h3
            id={titleId}
            style={{
              margin: "0 0 12px",
              fontSize: 20,
              fontWeight: 700,
              color: "#1a1a1a",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {title}
          </h3>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
