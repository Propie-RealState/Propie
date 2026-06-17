import React from "react";
import type {
  AgentCertificationEntry,
  AgentEducationEntry,
  AgentExperienceEntry,
} from "../../../lib/agent-profile-completion";

type SectionProps<T> = {
  title: string;
  entries: T[];
  onChange: (entries: T[]) => void;
  isEditing: boolean;
  renderFields: (
    entry: T,
    index: number,
    onEntryChange: (index: number, next: T) => void,
  ) => React.ReactNode;
  emptyEntry: T;
};

function EditableSection<T>({
  title,
  entries,
  onChange,
  isEditing,
  renderFields,
  emptyEntry,
}: SectionProps<T>) {
  const list = entries.length > 0 ? entries : [emptyEntry];

  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: "20px",
        border: "1.5px solid #e5e5ea",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>{title}</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => onChange([...list, emptyEntry])}
            style={{
              background: "#f5f5f7",
              border: "none",
              borderRadius: 10,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Agregar
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((entry, index) => (
          <div key={index} style={{ padding: 12, borderRadius: 14, background: "#fafafa" }}>
            {renderFields(entry, index, (i, next) => {
              const copy = [...list];
              copy[i] = next;
              onChange(copy);
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e5ea",
  fontSize: 14,
  boxSizing: "border-box",
  marginBottom: 8,
};

type Props = {
  experience: AgentExperienceEntry[];
  certifications: AgentCertificationEntry[];
  education: AgentEducationEntry[];
  isEditing: boolean;
  onExperienceChange: (entries: AgentExperienceEntry[]) => void;
  onCertificationsChange: (entries: AgentCertificationEntry[]) => void;
  onEducationChange: (entries: AgentEducationEntry[]) => void;
};

export function AgentProfessionalSections({
  experience,
  certifications,
  education,
  isEditing,
  onExperienceChange,
  onCertificationsChange,
  onEducationChange,
}: Props) {
  const readOnlyValue = (value: string) => value || "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <EditableSection
        title="Experiencia"
        entries={experience}
        onChange={onExperienceChange}
        isEditing={isEditing}
        emptyEntry={{ position: "", company: "", years: "" }}
        renderFields={(entry, index, onEntryChange) =>
          isEditing ? (
            <>
              <input
                style={inputStyle}
                placeholder="Cargo"
                value={entry.position}
                onChange={(e) => onEntryChange(index, { ...entry, position: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Empresa / inmobiliaria"
                value={entry.company}
                onChange={(e) => onEntryChange(index, { ...entry, company: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Años de experiencia"
                value={entry.years}
                onChange={(e) => onEntryChange(index, { ...entry, years: e.target.value.replace(/\D/g, "") })}
              />
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "#1a1a1a" }}>
              {readOnlyValue(entry.position)} · {readOnlyValue(entry.company)} · {readOnlyValue(entry.years)} años
            </p>
          )
        }
      />

      <EditableSection
        title="Certificaciones"
        entries={certifications}
        onChange={onCertificationsChange}
        isEditing={isEditing}
        emptyEntry={{ name: "", issuer: "", year: "" }}
        renderFields={(entry, index, onEntryChange) =>
          isEditing ? (
            <>
              <input
                style={inputStyle}
                placeholder="Certificación"
                value={entry.name}
                onChange={(e) => onEntryChange(index, { ...entry, name: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Emisor"
                value={entry.issuer}
                onChange={(e) => onEntryChange(index, { ...entry, issuer: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Año"
                value={entry.year}
                onChange={(e) => onEntryChange(index, { ...entry, year: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              />
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "#1a1a1a" }}>
              {readOnlyValue(entry.name)} · {readOnlyValue(entry.issuer)} · {readOnlyValue(entry.year)}
            </p>
          )
        }
      />

      <EditableSection
        title="Educación"
        entries={education}
        onChange={onEducationChange}
        isEditing={isEditing}
        emptyEntry={{ institution: "", degree: "", year: "" }}
        renderFields={(entry, index, onEntryChange) =>
          isEditing ? (
            <>
              <input
                style={inputStyle}
                placeholder="Institución"
                value={entry.institution}
                onChange={(e) => onEntryChange(index, { ...entry, institution: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Título"
                value={entry.degree}
                onChange={(e) => onEntryChange(index, { ...entry, degree: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Año"
                value={entry.year}
                onChange={(e) => onEntryChange(index, { ...entry, year: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              />
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "#1a1a1a" }}>
              {readOnlyValue(entry.degree)} · {readOnlyValue(entry.institution)} · {readOnlyValue(entry.year)}
            </p>
          )
        }
      />
    </div>
  );
}
