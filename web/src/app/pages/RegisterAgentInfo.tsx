import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthHeroHeader } from "../components/AuthHeroHeader";
import { ArrowLeft, Check, GraduationCap, Award, Briefcase, Plus, X } from "lucide-react";
import React from "react";
import { useRegister } from "../../context/RegisterContext";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { buildRegisterPayload } from "../../lib/buildRegisterPayload";
import { RegisterSuccessOverlay } from "../components/register/RegisterSuccessOverlay";
import { REGISTER_COMPLETION } from "../components/register/registerCompletionTheme";
import { getPendingAvatarFile, clearPendingAvatarFile } from "../../lib/pending-avatar";
import { uploadAvatar } from "../modules/profile/services/upload-avatar.service";
import {
  FieldError,
  CharCounter,
  validateAgentCertification,
  validateAgentEducation,
  validateAgentExperience,
  validateBio,
  buildRegistrationContext,
  ensureRegistrationReady,
  handleRegisterValidationFailure,
} from "../../features/register/validation";

type EducationEntry = {
  id: string;
  institution: string;
  degree: string;
  year: string;
};

type CertificationEntry = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

type ExperienceEntry = {
  id: string;
  title: string;
  company: string;
  years: string;
};

export default function RegisterAgentInfo() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data, updateData, reset } = useRegister();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agentTheme = REGISTER_COMPLETION.AGENT;

  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);

  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  const [newEducation, setNewEducation] = useState({ institution: "", degree: "", year: "" });
  const [newCertification, setNewCertification] = useState({ name: "", issuer: "", year: "" });
  const [newExperience, setNewExperience] = useState({ title: "", company: "", years: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});

  const handleFinalizar = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationContext = buildRegistrationContext(data, {
        profilePhoto: getPendingAvatarFile(),
      });
      const readiness = ensureRegistrationReady(data, registrationContext);
      if (!readiness.valid) {
        navigate(readiness.route, {
          state: { registerFieldErrors: readiness.errors, fromFinalSubmit: true },
        });
        return;
      }

      updateData({
        mainGoal: "EXPLORE",
      });

      const payload = buildRegisterPayload(
        {
          ...data,
          mainGoal: "EXPLORE",
        },
        "AGENT",
        "EXPLORE"
      );

      const response = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const authData = response?.data;

      if (
        !authData?.accessToken ||
        !authData?.refreshToken ||
        !authData?.user
      ) {
        throw new Error("INVALID_REGISTER_RESPONSE");
      }

      auth.login(
        authData.accessToken,
        authData.refreshToken,
        authData.user
      );

      sessionStorage.setItem("userType", "agente");

      // Upload avatar if the user selected one during registration.
      const pendingAvatar = getPendingAvatarFile();
      if (pendingAvatar) {
        try {
          await uploadAvatar(pendingAvatar);
        } catch {
          // Non-fatal: avatar upload failure should not block registration completion.
        } finally {
          clearPendingAvatarFile();
        }
      }

      reset();

      setShowSuccess(true);
    } catch (error) {
      if (!handleRegisterValidationFailure(error, data, navigate)) {
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessFinish = useCallback(() => {
    setShowSuccess(false);
    navigate("/explore", { replace: true });
  }, [navigate]);

  const addEducation = () => {
    const result = validateAgentEducation(newEducation);
    if (!result.valid) {
      setFormErrors((prev) => ({ ...prev, education: result.error }));
      return;
    }
    setFormErrors((prev) => ({ ...prev, education: undefined }));
    if (newEducation.institution && newEducation.degree && newEducation.year) {
      setEducation([...education, { ...newEducation, id: Date.now().toString() }]);
      setNewEducation({ institution: "", degree: "", year: "" });
      setShowEducationForm(false);
    }
  };

  const addCertification = () => {
    const result = validateAgentCertification(newCertification);
    if (!result.valid) {
      setFormErrors((prev) => ({ ...prev, certification: result.error }));
      return;
    }
    setFormErrors((prev) => ({ ...prev, certification: undefined }));
    if (newCertification.name && newCertification.issuer && newCertification.year) {
      setCertifications([...certifications, { ...newCertification, id: Date.now().toString() }]);
      setNewCertification({ name: "", issuer: "", year: "" });
      setShowCertificationForm(false);
    }
  };

  const addExperience = () => {
    const mapped = { position: newExperience.title, company: newExperience.company, years: newExperience.years };
    const result = validateAgentExperience(mapped);
    if (!result.valid) {
      setFormErrors((prev) => ({ ...prev, experience: result.error }));
      return;
    }
    setFormErrors((prev) => ({ ...prev, experience: undefined }));
    if (newExperience.title && newExperience.company && newExperience.years) {
      setExperience([...experience, { ...newExperience, id: Date.now().toString() }]);
      setNewExperience({ title: "", company: "", years: "" });
      setShowExperienceForm(false);
    }
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((e) => e.id !== id));
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter((c) => c.id !== id));
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter((e) => e.id !== id));
  };

  const charCount = data.bio.length;
  const maxChars = 300;
  const bioError = validateBio(data.bio).error;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <RegisterSuccessOverlay
        open={showSuccess}
        variant="AGENT"
        title="¡Tu cuenta está lista!"
        subtitle="Ya creamos tu perfil de agente. Bienvenido a Propie."
        onFinish={handleSuccessFinish}
      />

      {/* ── HERO ── */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(160deg, #FF8C5B 0%, #C52E3E 55%, #A82534 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingBottom: 0,
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", width: 300, height: 300, background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)", top: -80, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 180, height: 180, background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", bottom: 40, left: -40, pointerEvents: "none" }} />

        <AuthHeroHeader />

        {/* Heading */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 28px 12px" }}>
          <h1
            style={{
              color: "white",
              fontSize: "clamp(26px, 7vw, 34px)",
              fontWeight: 800,
              letterSpacing: "-1.2px",
              lineHeight: 1.15,
              fontFamily: "'Sora', sans-serif",
              margin: 0,
            }}
          >
            ¡Ya casi terminamos!
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            Completá tu perfil profesional
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 24px 40px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Bio section */}
          <div>
            <label htmlFor="bio" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>
              Sobre mí <span style={{ color: "#9a9aa0", fontWeight: 400 }}>(opcional)</span>
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                id="bio"
                value={data.bio}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    updateData({
                      bio: e.target.value,
                    });
                  }
                }}
                placeholder="Contale a propietarios y clientes sobre tu experiencia, especialización, o lo que te diferencia..."
                rows={6}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1.5px solid #e5e5ea",
                  fontSize: 15,
                  color: "#1a1a1a",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                  resize: "none",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.6,
                }}
                onFocus={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor = "#C52E3E";
                  (e.target as HTMLTextAreaElement).style.boxShadow = "0 0 0 3px rgba(197,46,62,0.08)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor = "#e5e5ea";
                  (e.target as HTMLTextAreaElement).style.boxShadow = "none";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 16,
                }}
              >
                <CharCounter current={charCount} max={maxChars} />
              </div>
            </div>
            <FieldError message={bioError} />
          </div>

          {/* Education */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                Estudios <span style={{ color: "#9a9aa0", fontWeight: 400 }}>(opcional)</span>
              </label>
              <button
                onClick={() => setShowEducationForm(!showEducationForm)}
                style={{
                  background: showEducationForm ? "#fff4ed" : "white",
                  border: "1.5px solid #e5e5ea",
                  borderRadius: 10,
                  padding: "6px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#C52E3E",
                }}
              >
                <Plus size={14} />
                Agregar
              </button>
            </div>

            {showEducationForm && (
              <div style={{ background: "white", borderRadius: 14, padding: "16px", marginBottom: 12, border: "1.5px solid #e5e5ea" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                    placeholder="Institución"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                    placeholder="Título"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="text"
                    value={newEducation.year}
                    onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                    placeholder="Año"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={addEducation}
                    type="button"
                    data-testid="agent-education-save"
                    style={{
                      background: "#C52E3E",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px",
                      color: "white",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Guardar
                  </button>
                </div>
                <FieldError message={formErrors.education} />
              </div>
            )}

            {education.map((edu) => (
              <div
                key={edu.id}
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "1.5px solid #e5e5ea",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={18} color="#C52E3E" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{edu.degree}</div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    {edu.institution} • {edu.year}
                  </div>
                </div>
                <button
                  onClick={() => removeEducation(edu.id)}
                  style={{
                    background: "#f5f5f7",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={14} color="#9a9aa0" />
                </button>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                Certificaciones <span style={{ color: "#9a9aa0", fontWeight: 400 }}>(opcional)</span>
              </label>
              <button
                onClick={() => setShowCertificationForm(!showCertificationForm)}
                style={{
                  background: showCertificationForm ? "#fff4ed" : "white",
                  border: "1.5px solid #e5e5ea",
                  borderRadius: 10,
                  padding: "6px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#C52E3E",
                }}
              >
                <Plus size={14} />
                Agregar
              </button>
            </div>

            {showCertificationForm && (
              <div style={{ background: "white", borderRadius: 14, padding: "16px", marginBottom: 12, border: "1.5px solid #e5e5ea" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                    placeholder="Nombre de la certificación"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="text"
                    value={newCertification.issuer}
                    onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                    placeholder="Emisor"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="text"
                    value={newCertification.year}
                    onChange={(e) => setNewCertification({ ...newCertification, year: e.target.value })}
                    placeholder="Año"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={addCertification}
                    type="button"
                    data-testid="agent-certification-save"
                    style={{
                      background: "#C52E3E",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px",
                      color: "white",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Guardar
                  </button>
                </div>
                <FieldError message={formErrors.certification} />
              </div>
            )}

            {certifications.map((cert) => (
              <div
                key={cert.id}
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "1.5px solid #e5e5ea",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Award size={18} color="#C52E3E" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{cert.name}</div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    {cert.issuer} • {cert.year}
                  </div>
                </div>
                <button
                  onClick={() => removeCertification(cert.id)}
                  style={{
                    background: "#f5f5f7",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={14} color="#9a9aa0" />
                </button>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                Experiencia <span style={{ color: "#9a9aa0", fontWeight: 400 }}>(opcional)</span>
              </label>
              <button
                onClick={() => setShowExperienceForm(!showExperienceForm)}
                style={{
                  background: showExperienceForm ? "#fff4ed" : "white",
                  border: "1.5px solid #e5e5ea",
                  borderRadius: 10,
                  padding: "6px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#C52E3E",
                }}
              >
                <Plus size={14} />
                Agregar
              </button>
            </div>

            {showExperienceForm && (
              <div style={{ background: "white", borderRadius: 14, padding: "16px", marginBottom: 12, border: "1.5px solid #e5e5ea" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    value={newExperience.title}
                    onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                    placeholder="Cargo"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    placeholder="Empresa"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="text"
                    value={newExperience.years}
                    onChange={(e) => setNewExperience({ ...newExperience, years: e.target.value })}
                    placeholder="Años (ej: 2020-2023)"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid #e5e5ea",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={addExperience}
                    type="button"
                    data-testid="agent-experience-save"
                    style={{
                      background: "#C52E3E",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px",
                      color: "white",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Guardar
                  </button>
                </div>
                <FieldError message={formErrors.experience} />
              </div>
            )}

            {experience.map((exp) => (
              <div
                key={exp.id}
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "1.5px solid #e5e5ea",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Briefcase size={18} color="#C52E3E" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{exp.title}</div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    {exp.company} • {exp.years}
                  </div>
                </div>
                <button
                  onClick={() => removeExperience(exp.id)}
                  style={{
                    background: "#f5f5f7",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={14} color="#9a9aa0" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleFinalizar}
            disabled={isSubmitting}
            style={{
              width: "100%",
              background: isSubmitting ? "#e5e5ea" : agentTheme.primary,
              border: "none",
              borderRadius: 16,
              padding: "16px 20px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.18s ease",
              boxShadow: isSubmitting ? "none" : agentTheme.buttonShadow,
            }}
            onMouseEnter={(e) => {
              if (isSubmitting) return;
              (e.currentTarget as HTMLButtonElement).style.background = agentTheme.primaryHover;
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = agentTheme.buttonShadowHover;
            }}
            onMouseLeave={(e) => {
              if (isSubmitting) return;
              (e.currentTarget as HTMLButtonElement).style.background = agentTheme.primary;
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = agentTheme.buttonShadow;
            }}
          >
            <Check size={22} color="white" strokeWidth={2.5} />
            <span style={{ fontSize: 17, fontWeight: 800, color: "white", letterSpacing: "-0.2px" }}>
              {isSubmitting ? "Creando cuenta…" : "Finalizar"}
            </span>
          </button>

          {/* Info box */}
          <div
            style={{
              background: "linear-gradient(135deg, #fff4ed 0%, #ffe8d6 100%)",
              borderRadius: 16,
              padding: "16px 18px",
              marginTop: 8,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#C52E3E", lineHeight: 1.6, fontWeight: 500 }}>
              💡 Podés completar tu perfil en cualquier momento desde la configuración de tu cuenta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
