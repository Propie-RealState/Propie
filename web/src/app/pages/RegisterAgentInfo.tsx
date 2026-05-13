import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PropieLogo } from "../components/PropieLogo";
import { ArrowLeft, Home, Search, GraduationCap, Award, Briefcase, Plus, X } from "lucide-react";
import React from "react";

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
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);

  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  const [newEducation, setNewEducation] = useState({ institution: "", degree: "", year: "" });
  const [newCertification, setNewCertification] = useState({ name: "", issuer: "", year: "" });
  const [newExperience, setNewExperience] = useState({ title: "", company: "", years: "" });

  const handlePublish = () => {
    console.log("Ir a publicar", { bio, education, certifications, experience });
    navigate("/publicar");
  };

  const handleExplore = () => {
    console.log("Ir a explorar", { bio, education, certifications, experience });
    navigate("/explorar");
  };

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree && newEducation.year) {
      setEducation([...education, { ...newEducation, id: Date.now().toString() }]);
      setNewEducation({ institution: "", degree: "", year: "" });
      setShowEducationForm(false);
    }
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer && newCertification.year) {
      setCertifications([...certifications, { ...newCertification, id: Date.now().toString() }]);
      setNewCertification({ name: "", issuer: "", year: "" });
      setShowCertificationForm(false);
    }
  };

  const addExperience = () => {
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

  const charCount = bio.length;
  const maxChars = 300;

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

        {/* Nav row */}
        <div style={{ width: "100%", maxWidth: 420, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "white",
              padding: "8px 14px",
              backdropFilter: "blur(8px)",
            }}
          >
            <ArrowLeft size={15} color="white" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Volver</span>
          </button>

          <PropieLogo size={38} />

          {/* spacer */}
          <div style={{ width: 80 }} />
        </div>

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

        {/* Wave */}
        <div style={{ width: "100%", height: 44, position: "relative", marginTop: 8 }}>
          <svg viewBox="0 0 390 44" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 44 }}>
            <path d="M0,24 C90,48 300,0 390,24 L390,44 L0,44 Z" fill="#f5f5f7" />
          </svg>
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
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setBio(e.target.value);
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
                  fontSize: 12,
                  color: charCount > maxChars * 0.9 ? "#C52E3E" : "#9a9aa0",
                  fontWeight: 500,
                }}
              >
                {charCount}/{maxChars}
              </div>
            </div>
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

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "8px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
            <span style={{ fontSize: 13, color: "#9a9aa0", fontWeight: 500 }}>¿Qué querés hacer?</span>
            <div style={{ flex: 1, height: 1, background: "#e5e5ea" }} />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Publish button */}
            <button
              onClick={handlePublish}
              style={{
                width: "100%",
                background: "#C52E3E",
                border: "none",
                borderRadius: 16,
                padding: "18px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.18s ease",
                boxShadow: "0 4px 16px rgba(197,46,62,0.24)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#A82534";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(197,46,62,0.32)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#C52E3E";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(197,46,62,0.24)";
              }}
            >
              <Home size={20} color="white" strokeWidth={2} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>
                  Publicar mi propiedad
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                  Empezá a recibir consultas de inmediato
                </div>
              </div>
            </button>

            {/* Explore button */}
            <button
              onClick={handleExplore}
              style={{
                width: "100%",
                background: "white",
                border: "1.5px solid #e5e5ea",
                borderRadius: 16,
                padding: "18px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.18s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#C52E3E";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(197,46,62,0.1)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e5ea";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <Search size={20} color="#C52E3E" strokeWidth={2} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
                  Explorar propiedades
                </div>
                <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                  Mirá qué hay disponible en el mercado
                </div>
              </div>
            </button>
          </div>

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
