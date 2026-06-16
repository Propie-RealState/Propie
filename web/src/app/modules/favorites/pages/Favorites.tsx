import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { Heart } from 'lucide-react';

import { AppFooterNav } from '../../../components/navigation/AppFooterNav';
import { NotificationsBell } from '../../../components/navigation/NotificationsBell';
import PropertyCard from '../../explore/components/PropertyCard';
import { getPublishedProperties } from '../../explore/services/explore.service';
import type { Property } from '../../explore/types/property.types';
import { getFavoriteIds, toggleFavoriteId } from '../../../../lib/favorites-storage';
import { useAppTheme } from '../../../../theme/useAppTheme';
import { FavoritesPageSkeleton } from '../../../components/skeletons/PageSkeletons';
import { pageShellStyle } from '../../../components/layout/layout-styles';

export default function Favorites() {
  const navigate = useNavigate();
  const theme = useAppTheme();
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavoriteIds());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function syncFavorites() {
      setFavoriteIds(getFavoriteIds());
    }

    window.addEventListener('favorites:changed', syncFavorites);
    return () => {
      window.removeEventListener('favorites:changed', syncFavorites);
    };
  }, []);

  useEffect(() => {
    async function load() {
      const data = await getPublishedProperties();
      setProperties(data);
      setLoading(false);
    }

    load();
  }, []);

  const favorites = useMemo(
    () => properties.filter((property) => favoriteIds.includes(property.id)),
    [properties, favoriteIds],
  );

  return (
    <div style={{ ...pageShellStyle, background: '#f5f5f7' }}>
      <div
        style={{
          flexShrink: 0,
          background: 'white',
          borderBottom: '1px solid #f0f0f0',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            color: '#1a1a1a',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          Favoritos
        </h1>
        <NotificationsBell />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loading ? (
          <FavoritesPageSkeleton />
        ) : favorites.length === 0 ? (
          <div
            style={{
              marginTop: 48,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: theme.lightBgSolid,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={32} color={theme.primary} />
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: '#1a1a1a',
              }}
            >
              Todavía no guardaste propiedades
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#6e6e73', maxWidth: 280 }}>
              Explorá el listado y tocá el corazón para ver tus favoritos acá.
            </p>
            <button
              type="button"
              onClick={() => navigate('/explore')}
              style={{
                marginTop: 8,
                background: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: 14,
                padding: '12px 20px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Explorar propiedades
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFav
                onToggleFav={() => toggleFavoriteId(property.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AppFooterNav />
    </div>
  );
}
