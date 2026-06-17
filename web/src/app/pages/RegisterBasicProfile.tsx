import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { getAppTheme } from "../../theme/app-theme";
import { RegisterFlowShell } from "../components/register/RegisterFlowShell";
import { BasicProfileForm } from "../../features/register/components/BasicProfileForm";
import { validateBasicProfileStep, validateUnifiedAccountStep } from "../../features/register/validation";

export default function RegisterBasicProfile() {
  const { data, updateData } = useRegister();
  const navigate = useNavigate();
  const roleTheme = getAppTheme(data.role === "AGENT");

  useEffect(() => {
    if (!data.role) {
      navigate("/registro", { replace: true });
      return;
    }
    const account = validateUnifiedAccountStep(data);
    if (!account.valid) {
      navigate("/registro/account", { replace: true });
    }
  }, [data, navigate]);

  const handleValidSubmit = () => {
    const check = validateBasicProfileStep(data);
    if (!check.valid) return;
    navigate("/registro/verification");
  };

  if (!data.role) return null;

  return (
    <RegisterFlowShell
      title="Contanos sobre vos"
      subtitle="Personalizá tu perfil. Podés completar más datos después."
      heroGradient={roleTheme.heroGradient}
    >
      <BasicProfileForm
        data={data}
        updateData={updateData}
        theme={{ primary: roleTheme.primary }}
        onValidSubmit={handleValidSubmit}
      />
    </RegisterFlowShell>
  );
}
