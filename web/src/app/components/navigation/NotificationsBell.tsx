import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  TrendingDown,
} from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import { useNotificationCount } from '../../../hooks/useNotificationCount';
import { emitPushEngagement } from '../../../lib/push-notifications';
import { useAppTheme } from '../../../theme/useAppTheme';
import {
  getNotifications,
  type NotificationItem,
} from '../../modules/notifications/services/notifications.service';
import { excludePropertyConversationNotifications } from '../../modules/notifications/utils/notification-filters';
import {
  getNotificationRoute,
} from '../../modules/notifications/utils/notification-ui';

function NotificationIcon({
  type,
  color,
}: {
  type: string;
  color: string;
}) {
  switch (type) {
    case 'NEW_PROPERTY_NEARBY':
    case 'PROPERTY_PUBLISHED':
      return <MapPin size={18} color={color} />;
    case 'PROPERTY_PRICE_CHANGED':
      return <TrendingDown size={18} color={color} />;
    case 'PROPERTY_FAVORITE_UPDATED':
    case 'PROPERTY_UPDATED':
      return <Heart size={18} color={color} />;
    case 'AGENT_APPLICATION_RECEIVED':
    case 'AGENT_APPLICATION_ACCEPTED':
    case 'AGENT_APPLICATION_REJECTED':
      return <Briefcase size={18} color={color} />;
    case 'MESSAGE_RECEIVED':
      return <MessageCircle size={18} color={color} />;
    case 'VISIT_CREATED':
    case 'VISIT_CONFIRMED':
    case 'VISIT_CANCELLED':
    case 'VISIT_RESCHEDULED':
    case 'VISIT_REMINDER':
      return <Calendar size={18} color={color} />;
    default:
      return <Bell size={18} color={color} />;
  }
}

export function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useAppTheme();
  const count = useNotificationCount();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  // Recalculate fixed position whenever the panel opens or the window resizes
  useEffect(() => {
    if (!open) { setDropdownPos(null); return; }
    function update() {
      if (!btnRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top:   r.bottom + 8,
        right: window.innerWidth - r.right,
      });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !user) {
      return;
    }

    let cancelled = false;

    async function loadPreview() {
      setLoading(true);

      try {
        const response = await getNotifications({
          limit: 5,
          unreadOnly: true,
        });

        if (!cancelled) {
          setItems(excludePropertyConversationNotifications(response.items));
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [open, user?.id]);

  if (!user) {
    return null;
  }

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        aria-label="Notificaciones"
        onClick={() => {
          emitPushEngagement();
          setOpen((value) => !value);
        }}
        style={{
          position: 'relative',
          background: open ? theme.lightBgSolid : '#f5f5f7',
          border: 'none',
          borderRadius: 12,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Bell size={20} color="#1a1a1a" strokeWidth={2} />
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: '#ef4444',
              color: 'white',
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && dropdownPos && (
        <div
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            right: dropdownPos.right,
            width: 320,
            background: 'white',
            borderRadius: 16,
            border: '1px solid #e5e5ea',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#1a1a1a',
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Notificaciones
            </span>
            {count > 0 && (
              <span style={{ fontSize: 12, color: '#6e6e73' }}>
                {count} nueva{count === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 18, fontSize: 13, color: '#6e6e73' }}>
                Cargando...
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: 18, fontSize: 13, color: '#6e6e73' }}>
                No tenés notificaciones nuevas.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate(getNotificationRoute(item));
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'white',
                    padding: '14px 16px',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: theme.lightBgSolid,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <NotificationIcon
                      type={item.type}
                      color={theme.primary}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1a1a1a',
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#6e6e73',
                        marginTop: 2,
                        lineHeight: 1.45,
                      }}
                    >
                      {item.body}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/perfil');
            }}
            style={{
              width: '100%',
              border: 'none',
              borderTop: '1px solid #f0f0f0',
              background: 'white',
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: '#1a1a1a',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Mi perfil
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/notificaciones');
            }}
            style={{
              width: '100%',
              border: 'none',
              borderTop: '1px solid #f0f0f0',
              background: '#fafafa',
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 700,
              color: theme.primary,
              cursor: 'pointer',
            }}
          >
            Ver todas
          </button>
        </div>
      )}
    </div>
  );
}
