import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import React from "react";

// Import social media icons
const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const SMSIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// Mock property data - en producción esto vendría de props o estado global
const mockProperty = {
  id: "1",
  title: "Hermoso departamento en Palermo",
  price: "USD 285,000",
  address: "Av. Córdoba 3456, Palermo, CABA",
  photo: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
};

export default function Share() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Generar URL completa de la propiedad
  const propertyUrl = `${window.location.origin}/propiedad/${id || mockProperty.id}`;

  // Mensaje base para compartir
  const baseMessage = `${mockProperty.title} - ${mockProperty.price}\n${mockProperty.address}`;

  const handleShare = (platform: string) => {
    const message = customMessage ? `${customMessage}\n\n${baseMessage}` : baseMessage;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(propertyUrl);

    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedMessage}%0A${encodedUrl}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(mockProperty.title)}&body=${encodedMessage}%0A%0A${encodedUrl}`;
        break;
      case "sms":
        shareUrl = `sms:?body=${encodedMessage}%0A${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

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
      {/* Header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e5e5ea",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#1a1a1a",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <h1
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Compartir
        </h1>

        {/* Spacer */}
        <div style={{ width: 70 }} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 20px 40px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Property Preview Card */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "16px",
              border: "1.5px solid #e5e5ea",
              display: "flex",
              gap: 16,
            }}
          >
            <img
              src={mockProperty.photo}
              alt={mockProperty.title}
              style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  marginBottom: 6,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {mockProperty.price}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  marginBottom: 4,
                }}
              >
                {mockProperty.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6e6e73",
                  lineHeight: 1.4,
                }}
              >
                {mockProperty.address}
              </div>
            </div>
          </div>

          {/* Share Platforms */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "20px",
              border: "1.5px solid #e5e5ea",
            }}
          >
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Compartir por
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              {/* WhatsApp */}
              <button
                onClick={() => handleShare("whatsapp")}
                style={{
                  background: "#25D366",
                  border: "none",
                  borderRadius: 14,
                  padding: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                <WhatsAppIcon />
                WhatsApp
              </button>

              {/* Telegram */}
              <button
                onClick={() => handleShare("telegram")}
                style={{
                  background: "#0088cc",
                  border: "none",
                  borderRadius: 14,
                  padding: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                <TelegramIcon />
                Telegram
              </button>

              {/* Email */}
              <button
                onClick={() => handleShare("email")}
                style={{
                  background: "#EA4335",
                  border: "none",
                  borderRadius: 14,
                  padding: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                <EmailIcon />
                Email
              </button>

              {/* SMS */}
              <button
                onClick={() => handleShare("sms")}
                style={{
                  background: "#34C759",
                  border: "none",
                  borderRadius: 14,
                  padding: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                <SMSIcon />
                Mensaje
              </button>
            </div>
          </div>

          {/* Custom Message */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "20px",
              border: "1.5px solid #e5e5ea",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Agregar mensaje
            </h2>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: 13,
                color: "#6e6e73",
                lineHeight: 1.5,
              }}
            >
              Personaliza el mensaje que se enviará junto con el enlace de la propiedad
            </p>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Ej: Mirá esta propiedad que encontré, creo que te puede interesar..."
              rows={4}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                border: "1.5px solid #e5e5ea",
                fontSize: 15,
                color: "#1a1a1a",
                outline: "none",
                resize: "none",
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.6,
                boxSizing: "border-box",
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
                fontSize: 12,
                color: "#9a9aa0",
                marginTop: 8,
                textAlign: "right",
              }}
            >
              {customMessage.length} caracteres
            </div>
          </div>

          {/* Copy Link */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "20px",
              border: "1.5px solid #e5e5ea",
            }}
          >
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: 16,
                fontWeight: 700,
                color: "#1a1a1a",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Copiar enlace
            </h2>
            <div
              style={{
                background: "#f5f5f7",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 12,
                wordBreak: "break-all",
                fontSize: 14,
                color: "#6e6e73",
                lineHeight: 1.5,
              }}
            >
              {propertyUrl}
            </div>
            <button
              onClick={handleCopyLink}
              style={{
                width: "100%",
                background: copied ? "#34C759" : "#1a1a1a",
                border: "none",
                borderRadius: 14,
                padding: "14px",
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
            >
              {copied ? (
                <>
                  <Check size={20} />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copiar enlace
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
