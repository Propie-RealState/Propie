import { useState } from "react";
import { PublishWizardCTA } from "../components/PublishWizardCTA";
import { PublishWizardLayout } from "../components/PublishWizardLayout";
import { CheckCircle2, Upload, MapPin, DollarSign, Image as ImageIcon, Home, Tag, BedDouble, Bath, Maximize2 } from "lucide-react";
import React from "react";
import {
  usePropertyPublish,
} from "../context/PropertyPublishContext";
import {
  publishProperty,
} from "../services/publish-property";
import PublishSuccessModal from "./PublishSuccess";
import { useAppTheme } from "../../../../theme/useAppTheme";
import { formatPrice } from "../../explore/utils/formatPrice";

const propertyTypeLabel: Record<string, string> = {
  HOUSE:      "Casa",
  APARTMENT:  "Departamento",
  LAND:       "Terreno",
  COMMERCIAL: "Local comercial",
  OFFICE:     "Oficina",
};

const listingTypeLabel: Record<string, string> = {
  SALE:      "Venta",
  RENT:      "Alquiler",
  TEMPORARY: "Temporario",
};

export default function PublishStep5() {
  const theme = useAppTheme();

  const {
    data,
  } = usePropertyPublish();
  const [checklist, setChecklist] = useState({
    autorizado: false,
    terminos: false,
    identidad: true, // Auto-checked because user completed registration
  });
  const [escritura, setEscritura] = useState<File | null>(null);
  const [autorizacion, setAutorizacion] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const handleCheckboxChange = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileUpload = (type: "escritura" | "autorizacion", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "escritura") setEscritura(file);
      else setAutorizacion(file);
    }
  };

  const handlePublish =
    async () => {

      if (
        !data.propertyId
      ) {
        return;
      }

      try {

        await publishProperty(
          data.propertyId
        );

        setShowSuccess(true);

      } catch (error) {

        console.error(
          "Publish failed",
          error
        );
      }
    };

  const isFormValid = checklist.autorizado && checklist.terminos && checklist.identidad;

  const publishHint =
    showValidation && !isFormValid
      ? "Completá todas las verificaciones requeridas para continuar"
      : undefined;

  const handlePublishAttempt = () => {
    if (!isFormValid) {
      setShowValidation(true);
      return;
    }

    void handlePublish();
  };

  const previewPrice = data.price
    ? formatPrice(data.price, data.currency ?? "USD")
    : "Sin precio";

  const previewAddress = data.address || data.city || "Sin ubicación";

  return (
    <>
      <PublishWizardLayout
        title="Verificación y publicar"
        footer={
          <PublishWizardCTA
            label="Publicar propiedad"
            onClick={handlePublishAttempt}
            hint={publishHint}
            large
          />
        }
      >
          {/* Checklist */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
              Verificación
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Item 1 */}
              <label
                style={{
                  background: "white",
                  border: "2px solid transparent",
                  borderRadius: 16,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                }}
              >
                <input
                  type="checkbox"
                  checked={checklist.autorizado}
                  onChange={() => handleCheckboxChange("autorizado")}
                  className="visually-hidden"
                />
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    border: checklist.autorizado ? `2px solid ${theme.primary}` : "2px solid #d1d1d6",
                    background: checklist.autorizado ? theme.primary : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {checklist.autorizado && <CheckCircle2 size={16} color="white" />}
                </div>
                <div style={{ flex: 1, fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>
                  Soy titular o estoy autorizado a publicar esta propiedad
                </div>
              </label>

              {/* Item 2 */}
              <label
                style={{
                  background: "white",
                  border: "2px solid transparent",
                  borderRadius: 16,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                }}
              >
                <input
                  type="checkbox"
                  checked={checklist.terminos}
                  onChange={() => handleCheckboxChange("terminos")}
                  className="visually-hidden"
                />
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    border: checklist.terminos ? `2px solid ${theme.primary}` : "2px solid #d1d1d6",
                    background: checklist.terminos ? theme.primary : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {checklist.terminos && <CheckCircle2 size={16} color="white" />}
                </div>
                <div style={{ flex: 1, fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>
                  Acepto los términos y condiciones de publicación
                </div>
              </label>

              {/* Item 3 - Auto-checked */}
              <div
                style={{
                  background: "white",
                  border: "2px solid transparent",
                  borderRadius: 16,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                  opacity: 0.7,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={16} color="white" />
                </div>
                <div style={{ flex: 1, fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>
                  Identidad validada
                </div>
              </div>
            </div>
          </div>

          {/* Optional uploads */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
              Documentos opcionales
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Escritura */}
              <label
                style={{
                  background: "white",
                  border: "2px dashed #d1d1d6",
                  borderRadius: 16,
                  padding: "18px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => handleFileUpload("escritura", e)}
                  className="visually-hidden"
                />
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: escritura ? "#f0eeff" : "#f8f8f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {escritura ? <CheckCircle2 size={20} color={theme.primary} /> : <Upload size={20} color="#9a9aa0" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                    {escritura ? escritura.name : "Escritura"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    {escritura ? "Documento cargado" : "PDF, JPG o PNG"}
                  </div>
                </div>
              </label>

              {/* Autorización */}
              <label
                style={{
                  background: "white",
                  border: "2px dashed #d1d1d6",
                  borderRadius: 16,
                  padding: "18px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => handleFileUpload("autorizacion", e)}
                  className="visually-hidden"
                />
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: autorizacion ? "#f0eeff" : "#f8f8f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {autorizacion ? <CheckCircle2 size={20} color={theme.primary} /> : <Upload size={20} color="#9a9aa0" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                    {autorizacion ? autorizacion.name : "Autorización"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                    {autorizacion ? "Documento cargado" : "PDF, JPG o PNG"}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Sora', sans-serif" }}>
              Vista previa
            </h3>
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: "18px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Title */}
              {data.title && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ImageIcon size={20} color={theme.primary} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{data.title}</div>
                      <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>Título</div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "#f0f0f0" }} />
                </>
              )}

              {/* Price */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <DollarSign size={20} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{previewPrice}</div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>Precio</div>
                </div>
              </div>

              <div style={{ height: 1, background: "#f0f0f0" }} />

              {/* Location */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin size={20} color="#ca8a04" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{previewAddress}</div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>Ubicación</div>
                </div>
              </div>

              <div style={{ height: 1, background: "#f0f0f0" }} />

              {/* Property type */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #f0eeff 0%, #e4deff 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Home size={20} color={theme.primary} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                    {data.propertyType ? propertyTypeLabel[data.propertyType] ?? data.propertyType : "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>Tipo de propiedad</div>
                </div>
              </div>

              <div style={{ height: 1, background: "#f0f0f0" }} />

              {/* Operation type */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Tag size={20} color="#be185d" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                    {data.listingType ? listingTypeLabel[data.listingType] ?? data.listingType : "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>Operación</div>
                </div>
              </div>

              {/* Bedrooms / Bathrooms / m² — only show if at least one is set */}
              {(data.bedrooms || data.bathrooms || data.areaM2) ? (
                <>
                  <div style={{ height: 1, background: "#f0f0f0" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "#f8f8fb", borderRadius: 12, padding: "12px 8px" }}>
                      <BedDouble size={18} color={theme.primary} />
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{data.bedrooms ?? "—"}</div>
                      <div style={{ fontSize: 11, color: "#6e6e73" }}>Hab.</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "#f8f8fb", borderRadius: 12, padding: "12px 8px" }}>
                      <Bath size={18} color={theme.primary} />
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{data.bathrooms ?? "—"}</div>
                      <div style={{ fontSize: 11, color: "#6e6e73" }}>Baños</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "#f8f8fb", borderRadius: 12, padding: "12px 8px" }}>
                      <Maximize2 size={18} color={theme.primary} />
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{data.areaM2 ?? "—"}</div>
                      <div style={{ fontSize: 11, color: "#6e6e73" }}>m²</div>
                    </div>
                  </div>
                </>
              ) : null}

              {/* Description */}
              {data.description && (
                <>
                  <div style={{ height: 1, background: "#f0f0f0" }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>Descripción</div>
                    <div style={{ fontSize: 13, color: "#6e6e73", lineHeight: 1.6 }}>
                      {data.description.length > 120 ? `${data.description.slice(0, 120)}...` : data.description}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
      </PublishWizardLayout>

      <PublishSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
