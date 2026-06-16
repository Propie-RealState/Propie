import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { useAppTheme } from "../../../../theme/useAppTheme";
import { useAuth } from "../../../../context/AuthContext";
import { isAgentRole } from "../../../../lib/roles";
import { AppFooterNav } from "../../../components/navigation/AppFooterNav";
import { NotificationsBell } from "../../../components/navigation/NotificationsBell";
import { ConversationListItem } from "../components/ConversationListItem";
import { emitPropertyConversationsChanged } from "../utils/conversation-role-ui";
import {
  listHistoricalPropertyConversations,
  listPropertyConversations,
} from "../services/property-conversations.service";
import type { PropertyConversation } from "../types/property-conversation.types";
import { ConversationListSkeleton } from "../../../components/skeletons/PageSkeletons";
import { pageShellStyle } from "../../../components/layout/layout-styles";

export default function ConversationsInbox() {
  const navigate = useNavigate();
  const colors = useAppTheme();
  const { user } = useAuth();
  const isAgent = isAgentRole(user?.role);

  const [conversations, setConversations] = useState<PropertyConversation[]>([]);
  const [historical, setHistorical] = useState<PropertyConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const [active, archived] = await Promise.all([
        listPropertyConversations(),
        isAgent ? listHistoricalPropertyConversations() : Promise.resolve([]),
      ]);

      setConversations(active);
      setHistorical(archived);
      emitPropertyConversationsChanged();
    } catch (error) {
      console.error("Error loading conversations", error);
    } finally {
      setLoading(false);
    }
  }, [isAgent]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const allConversations = useMemo(() => {
    const seen = new Set<string>();

    return [...conversations, ...historical].filter((conversation) => {
      if (seen.has(conversation.id)) {
        return false;
      }

      seen.add(conversation.id);
      return true;
    });
  }, [conversations, historical]);

  return (
    <div style={{ ...pageShellStyle, background: "#f5f5f7" }}>
      <div
        style={{
          flexShrink: 0,
          background: "white",
          borderBottom: "1px solid #f0f0f0",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#1a1a1a",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
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
          Mensajes
        </h1>

        <NotificationsBell />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "22px 20px 100px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {loading ? (
            <ConversationListSkeleton />
          ) : allConversations.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: 20,
                border: "1.5px solid #e5e5ea",
                padding: 28,
                textAlign: "center",
                color: "#6e6e73",
              }}
            >
              <MessageCircle
                size={32}
                color={colors.primary}
                style={{ marginBottom: 12 }}
              />
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
                Tus conversaciones sobre propiedades aparecerán acá cuando
                contactes o recibas consultas.
              </p>
            </div>
          ) : (
            allConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                onClick={() => navigate(`/mensajes/${conversation.id}`)}
              />
            ))
          )}
        </div>
      </div>

      <AppFooterNav />
    </div>
  );
}
