import { MessageCircle } from "lucide-react";

import type { PropertyConversation } from "../types/property-conversation.types";
import {
  CONVERSATION_ROLE_COLORS,
  getConversationRoleColor,
} from "../utils/conversation-role-ui";

type ConversationListItemProps = {
  conversation: PropertyConversation;
  onClick: () => void;
};

export function ConversationListItem({
  conversation,
  onClick,
}: ConversationListItemProps) {
  const unread = conversation.unreadCount ?? 0;
  const roleLabel = conversation.inboxRoleLabel ?? "Cliente";
  const subtitle = conversation.inboxSubtitle ?? "Consulta de propiedad";
  const propertyTitle = conversation.propertyTitle;
  const roleColor =
    conversation.conversationType === "PROPERTY_INTERNAL"
      ? getConversationRoleColor(
          roleLabel === "Agente"
            ? "AGENT"
            : roleLabel === "Propietario"
              ? "OWNER"
              : "CLIENT",
        )
      : CONVERSATION_ROLE_COLORS.CLIENT;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        background: "white",
        borderRadius: 20,
        border: "1.5px solid #e5e5ea",
        padding: 18,
        cursor: "pointer",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${roleColor}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <MessageCircle size={22} color={roleColor} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "#1a1a1a",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            <span style={{ color: roleColor }}>{roleLabel}</span>
            <span style={{ color: "#9a9aa0", fontWeight: 600 }}>
              {" "}
              · {subtitle}
            </span>
          </h3>
          {unread > 0 && (
            <span
              style={{
                minWidth: 22,
                height: 22,
                borderRadius: 999,
                background: roleColor,
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 7px",
              }}
            >
              {unread}
            </span>
          )}
        </div>

        {propertyTitle && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              fontWeight: 600,
              color: "#1a1a1a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {propertyTitle}
          </p>
        )}

        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            color: "#6e6e73",
            lineHeight: 1.45,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {conversation.lastMessagePreview || "Sin mensajes todavía"}
        </p>

        {conversation.readOnly && (
          <span
            style={{
              display: "inline-block",
              marginTop: 8,
              fontSize: 11,
              fontWeight: 600,
              color: "#6e6e73",
              background: "#f5f5f7",
              borderRadius: 999,
              padding: "4px 8px",
            }}
          >
            Solo lectura
          </span>
        )}
      </div>
    </button>
  );
}
