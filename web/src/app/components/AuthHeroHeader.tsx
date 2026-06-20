import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

import { PropieLogo } from "./PropieLogo";
import { RegisterProgress } from "./register/RegisterProgress";

type Props = {
  logoSize?: number;
  onBack?: () => void;
  showRegisterProgress?: boolean;
};

export function AuthHeroHeader({
  logoSize = 72,
  onBack,
  showRegisterProgress = true,
}: Props) {
  const navigate = useNavigate();

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          paddingTop: "max(12px, env(safe-area-inset-top))",
          paddingLeft: 20,
          paddingRight: 20,
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={onBack ?? (() => navigate(-1))}
          aria-label="Volver"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.28)",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} color="white" strokeWidth={2.25} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          paddingTop: 6,
          paddingBottom: 10,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <PropieLogo size={logoSize} />
      </div>

      {showRegisterProgress ? <RegisterProgress /> : null}
    </div>
  );
}
