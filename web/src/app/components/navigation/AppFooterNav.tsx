import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  Heart,
  Home,
  LogIn,
  MessageCircle,
  Plus,
  Search,
  User,
} from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import { getNavAudience } from '../../../lib/roles';
import { useAppTheme } from '../../../theme/useAppTheme';
import { usePropertyPublish } from '../../modules/publish/context/PropertyPublishContext';

export function AppFooterNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useAppTheme();
  const { user } = useAuth();
  const { startCreatePublish } = usePropertyPublish();
  const audience = getNavAudience(user);
  const isOnExplore =
    location.pathname === '/explorar' ||
    location.pathname.startsWith('/explorar/');

  const navBtn = (
    Icon: React.ComponentType<{
      size: number;
      color: string;
      strokeWidth: number;
    }>,
    label: string,
    path: string,
    onNavigate?: () => void,
  ) => {
    const isActive =
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`);
    const color = isActive ? theme.primary : '#6e6e73';

    return (
      <button
        key={path}
        type="button"
        onClick={() => {
          onNavigate?.();
          navigate(path);
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 10px',
          borderRadius: 12,
          flex: 1,
        }}
      >
        <Icon size={22} color={color} strokeWidth={1.8} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            color,
          }}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div
      style={{
        flexShrink: 0,
        background: 'white',
        borderTop: '1px solid #efefef',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.07)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 4px)',
      }}
    >
      <div className="flex items-center px-3 py-2">
        {audience === 'guest' && (
          <>
            {navBtn(Home, 'Inicio', '/')}
            {!isOnExplore && navBtn(Search, 'Explorar', '/explorar')}
            <button
              type="button"
              onClick={() => navigate('/ingresar')}
              style={{
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: theme.primary,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 18,
                padding: '10px 0',
                margin: '2px 10px',
                boxShadow: `0 4px 14px rgba(${theme.rgb}, 0.30)`,
              }}
            >
              <LogIn size={18} color="white" strokeWidth={2} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "'Sora', sans-serif",
                  color: 'white',
                }}
              >
                Ingresar
              </span>
            </button>
          </>
        )}

        {audience === 'client' && (
          <>
            {navBtn(Search, 'Explorar', '/explorar')}
            {navBtn(Heart, 'Favoritos', '/favoritos')}
            {navBtn(MessageCircle, 'Mensajes', '/mensajes')}
            {navBtn(User, 'Perfil', '/perfil')}
          </>
        )}

        {audience === 'publisher' && (
          <>
            {navBtn(Plus, 'Publicar', '/publicar', startCreatePublish)}
            {navBtn(Building2, 'Mis Props.', '/mis-propiedades')}
            {navBtn(MessageCircle, 'Mensajes', '/mensajes')}
            {navBtn(User, 'Perfil', '/perfil')}
          </>
        )}
      </div>
    </div>
  );
}
