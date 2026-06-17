import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { getAppTheme, syncUserTypeFromRole } from "../../theme/app-theme";
import { RegisterFlowShell } from "../components/register/RegisterFlowShell";
import { RegisterAccountForm } from "../../features/register/components/RegisterAccountForm";
import { validateUnifiedAccountStep } from "../../features/register/validation";

const THEME = {
  primary: "#4417E6",
  focusShadow: "0 0 0 3px rgba(68,23,230,0.08)",
};

export default function RegisterAccount() {
  const { data, updateData } = useRegister();
  const navigate = useNavigate();
  const roleTheme = getAppTheme(data.role === "AGENT");

  useEffect(() => {
    if (!data.role) {
      navigate("/registro", { replace: true });
    }
  }, [data.role, navigate]);

  useEffect(() => {
    if (data.role === "OWNER") {
      sessionStorage.setItem("userType", "propie");
      updateData({ mainGoal: "PUBLISH" });
    } else if (data.role === "AGENT") {
      syncUserTypeFromRole("AGENT");
      updateData({ mainGoal: "EXPLORE" });
    } else if (data.role === "CLIENT") {
      sessionStorage.removeItem("userType");
      updateData({ mainGoal: "EXPLORE" });
    }
  }, [data.role, updateData]);

  const handleValidSubmit = () => {
    const check = validateUnifiedAccountStep(data);
    if (!check.valid) return;
    navigate("/registro/profile");
  };

  if (!data.role) return null;

  return (
    <RegisterFlowShell
      title="Creá tu cuenta"
      subtitle="Ingresá tu email y elegí una contraseña segura."
      heroGradient={roleTheme.heroGradient}
    >
      <RegisterAccountForm
        data={data}
        updateData={updateData}
        theme={{ ...THEME, primary: roleTheme.primary }}
        onValidSubmit={handleValidSubmit}
      />
    </RegisterFlowShell>
  );
}
