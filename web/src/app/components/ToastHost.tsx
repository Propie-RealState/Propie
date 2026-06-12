import { useEffect, useState } from "react";

import { setToastListener } from "../../lib/toast";

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setToastListener((nextMessage) => {
      setMessage(nextMessage);
    });

    return () => {
      setToastListener(null);
    };
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setMessage(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: "max(24px, env(safe-area-inset-bottom))",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "#1a1a1a",
          color: "white",
          borderRadius: 14,
          padding: "14px 18px",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.45,
          fontFamily: "'Inter', sans-serif",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
        }}
      >
        {message}
      </div>
    </div>
  );
}
