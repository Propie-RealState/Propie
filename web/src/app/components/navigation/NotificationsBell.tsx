import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Briefcase, Heart, MessageCircle, TrendingDown } from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import { useNotificationCount } from '../../../hooks/useNotificationCount';
import { useAppTheme } from '../../../theme/useAppTheme';
import { canPublishProperties } from '../../../lib/roles';

type NotificationPreview = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

export function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useAppTheme();
  const count = useNotificationCount();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  if (!user) {
    return null;
  }

  const previews: NotificationPreview[] = canPublishProperties(user.role)
    ? count > 0
      ? [
          {
            id: 'agent-requests',
            title: 'Solicitudes de agentes',
            description: `${count} pendiente${count === 1 ? '' : 's'} de revisión`,
            icon: <Briefcase size={18} color={theme.primary} />,
          },
        ]
      : [
          {
            id: 'empty-owner',
            title: 'Sin novedades',
            description: 'Te avisamos cuando haya actividad en tus propiedades',
            icon: <Bell size={18} color="#9a9aa0" />,
          },
        ]
    : [
        {
          id: 'messages',
          title: 'Mensajes',
          description: 'Respuestas de propietarios y agentes',
          icon: <MessageCircle size={18} color={theme.primary} />,
        },
        {
          id: 'price-drops',
          title: 'Bajas de precio',
          description: 'En propiedades que guardaste',
          icon: <TrendingDown size={18} color={theme.primary} />,
        },
        {
          id: 'favorites',
          title: 'Favoritos',
          description: 'Novedades en tus guardados',
          icon: <Heart size={18} color={theme.primary} />,
        },
      ];

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Notificaciones"
        onClick={() => setOpen((value) => !value)}
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

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 300,
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

          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {previews.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/notificaciones');
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
                  {item.icon}
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
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

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
