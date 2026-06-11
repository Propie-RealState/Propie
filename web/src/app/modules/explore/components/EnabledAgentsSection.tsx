import { useNavigate } from "react-router-dom";
import { MessageCircle, Star, UserCheck } from "lucide-react";

export type EnabledAgent = {
  id: string;
  name: string;
  photo?: string;
  rating: number;
  totalReviews: number;
};

type EnabledAgentsSectionProps = {
  agents: EnabledAgent[];
  primaryColor: string;
  lightBg: string;
  propertyId?: string;
  propertyTitle?: string;
  showManagementActions?: boolean;
  onOpenChat?: (agentId: string) => void;
  onOpenOwnerChat?: () => void;
  showOwnerChat?: boolean;
};

export function EnabledAgentsSection({
  agents,
  primaryColor,
  lightBg,
  propertyId,
  propertyTitle,
  showManagementActions = false,
  onOpenChat,
  onOpenOwnerChat,
  showOwnerChat = false,
}: EnabledAgentsSectionProps) {
  const navigate = useNavigate();

  if (agents.length === 0) {
    return null;
  }

  function handleOpenProfile(agentId: string) {
    navigate(`/agentes/${agentId}`, {
      state: {
        reviewPropertyId: propertyId,
        reviewPropertyTitle: propertyTitle,
      },
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {showOwnerChat && onOpenOwnerChat && (
        <button
          type="button"
          onClick={onOpenOwnerChat}
          style={{
            width: "100%",
            background: primaryColor,
            border: "none",
            borderRadius: 10,
            padding: "12px",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <MessageCircle size={16} />
          Abrir chat con propietario
        </button>
      )}

      <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: "20px",
        border: "1.5px solid #e5e5ea",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: 15,
          fontWeight: 700,
          color: "#1a1a1a",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        Agentes habilitados ({agents.length})
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {agents.map((agent) => {
          const initial = agent.name.charAt(0).toUpperCase();
          const hasRating = agent.totalReviews > 0 && agent.rating > 0;

          return (
            <div
              key={agent.id}
              style={{
                background: showManagementActions ? lightBg : "#f5f5f7",
                borderRadius: 14,
                padding: showManagementActions ? "16px" : "12px 14px",
              }}
            >
              <button
                type="button"
                onClick={() => handleOpenProfile(agent.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                  marginBottom: showManagementActions ? 12 : 0,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#f0eeff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {agent.photo ? (
                    <img
                      src={agent.photo}
                      alt={agent.name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: primaryColor,
                      }}
                    >
                      {initial}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#1a1a1a",
                      marginBottom: 2,
                    }}
                  >
                    {agent.name}
                  </div>
                  {hasRating ? (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6e6e73",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
                        {agent.rating.toFixed(1)}
                      </span>
                      <span>({agent.totalReviews})</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#9a9aa0" }}>
                      Sin reseñas aún
                    </div>
                  )}
                </div>
              </button>

              {showManagementActions && onOpenChat && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => onOpenChat(agent.id)}
                    style={{
                      flex: 1,
                      background: primaryColor,
                      border: "none",
                      borderRadius: 10,
                      padding: "10px",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <MessageCircle size={16} />
                    Abrir chat
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenProfile(agent.id)}
                    style={{
                      background: "white",
                      border: "1.5px solid #e5e5ea",
                      borderRadius: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}
                  >
                    <UserCheck size={15} color={primaryColor} />
                    Perfil
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
