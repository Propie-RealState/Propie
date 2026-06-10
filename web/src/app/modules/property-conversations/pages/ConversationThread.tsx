import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

import { useAppTheme } from "../../../../theme/useAppTheme";
import { useAuth } from "../../../../context/AuthContext";
import { useConversationPolling } from "../hooks/useConversationPolling";
import {
  getPropertyConversation,
  listPropertyConversationMessages,
  markPropertyConversationRead,
  sendPropertyConversationMessage,
} from "../services/property-conversations.service";
import type {
  PropertyConversation,
  PropertyConversationMessage,
} from "../types/property-conversation.types";

export default function ConversationThread() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const colors = useAppTheme();
  const { user } = useAuth();

  const [conversation, setConversation] = useState<PropertyConversation | null>(null);
  const [messages, setMessages] = useState<PropertyConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadThread = useCallback(async () => {
    if (!conversationId) {
      return;
    }

    try {
      const [conversationData, messageData] = await Promise.all([
        getPropertyConversation(conversationId),
        listPropertyConversationMessages(conversationId),
      ]);

      setConversation(conversationData);
      setMessages(messageData);

      if (!conversationData.readOnly) {
        await markPropertyConversationRead(conversationId);
      }
    } catch (error) {
      console.error("Error loading conversation thread", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  useConversationPolling(loadThread, Boolean(conversationId));

  async function handleSend() {
    if (!conversationId || !draft.trim() || conversation?.readOnly) {
      return;
    }

    try {
      setSending(true);
      const message = await sendPropertyConversationMessage(
        conversationId,
        draft.trim(),
      );

      setMessages((current) => [...current, message]);
      setDraft("");
    } catch (error) {
      console.error("Error sending message", error);
      alert("No pudimos enviar el mensaje. Intentá nuevamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          background: "white",
          borderBottom: "1px solid #f0f0f0",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/mensajes")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: "#1a1a1a",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Conversación
          </h1>
          {conversation?.readOnly && (
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6e6e73" }}>
              Solo lectura
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "#6e6e73", padding: 24 }}>
            Cargando mensajes...
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === user?.id;

            return (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    background: isMine ? colors.primary : "white",
                    color: isMine ? "white" : "#1a1a1a",
                    border: isMine ? "none" : "1.5px solid #e5e5ea",
                    borderRadius: isMine
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    padding: "12px 16px",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {message.body}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          background: "white",
          borderTop: "1px solid #e5e5ea",
          padding: "16px",
          display: "flex",
          gap: 12,
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void handleSend();
            }
          }}
          disabled={conversation?.readOnly || sending}
          placeholder={
            conversation?.readOnly
              ? "Conversación de solo lectura"
              : "Escribí tu mensaje..."
          }
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 14,
            border: "1.5px solid #e5e5ea",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!draft.trim() || conversation?.readOnly || sending}
          style={{
            background:
              draft.trim() && !conversation?.readOnly ? colors.primary : "#e5e5ea",
            border: "none",
            borderRadius: 12,
            padding: "12px 16px",
            cursor:
              draft.trim() && !conversation?.readOnly ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send
            size={18}
            color={draft.trim() && !conversation?.readOnly ? "white" : "#9a9aa0"}
          />
        </button>
      </div>
    </div>
  );
}
