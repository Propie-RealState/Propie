import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { Heart } from 'lucide-react';

import { pageShellStyle } from '../../../components/layout/layout-styles';
import { AppFooterNav } from '../../../components/navigation/AppFooterNav';
import { NotificationsBell } from '../../../components/navigation/NotificationsBell';
import { ActivationChecklist } from '../../../components/onboarding/ActivationChecklist';
import { ConversionEmptyState } from '../../../components/onboarding/ConversionEmptyState';
import PropertyCard from '../../explore/components/PropertyCard';
import { getPublishedProperties } from '../../explore/services/explore.service';
import type { Property } from '../../explore/types/property.types';
import { getFavoriteIds, toggleFavoriteId } from '../../../../lib/favorites-storage';
import { getClientActivationSteps } from '../../../../lib/onboarding/activation';
import { useAuth } from '../../../../context/AuthContext';
import { FavoritesPageSkeleton } from '../../../components/skeletons/PageSkeletons';

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const activationSteps = user?.id
    ? getClientActivationSteps(user.id, favorites.length > 0)
    : [];

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
        {user?.id && activationSteps.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            <ActivationChecklist
              title="Tu primer paso en Propie"
              subtitle="Completá estos pasos para encontrar tu próximo hogar."
              steps={activationSteps}
            />
          </div>
        ) : null}

        {loading ? (
          <FavoritesPageSkeleton />
        ) : favorites.length === 0 ? (
          <ConversionEmptyState
            icon={Heart}
            title="Todavía no guardaste ninguna propiedad"
            description="Explorá el listado y tocá el corazón en las que te interesen."
            benefit="Tus favoritos quedan guardados para comparar y contactar cuando quieras."
            ctaLabel="Explorar propiedades"
            onCta={() => navigate('/explore')}
          />
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
