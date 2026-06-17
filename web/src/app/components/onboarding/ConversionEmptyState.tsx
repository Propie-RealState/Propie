import type { LucideIcon } from 'lucide-react';
import React from 'react';

import { useAppTheme } from '../../../theme/useAppTheme';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  benefit: string;
  ctaLabel: string;
  onCta: () => void;
  secondaryCtaLabel?: string;
  onSecondaryCta?: () => void;
};

export function ConversionEmptyState({
  icon: Icon,
  title,
  description,
  benefit,
  ctaLabel,
  onCta,
  secondaryCtaLabel,
  onSecondaryCta,
}: Props) {
  const theme = useAppTheme();

  return (
    <div
      style={{
        marginTop: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        textAlign: 'center',
        padding: '8px 12px 24px',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          background: theme.lightBgSolid,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={36} color={theme.primary} strokeWidth={1.6} />
      </div>

      <div style={{ maxWidth: 300 }}>
        <h2
          style={{
            margin: '0 0 8px',
            fontSize: 20,
            fontWeight: 800,
            color: '#1a1a1a',
            fontFamily: "'Sora', sans-serif",
            letterSpacing: '-0.3px',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: '0 0 10px',
            fontSize: 14,
            color: '#6e6e73',
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: theme.primary,
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {benefit}
        </p>
      </div>

      <button
        type="button"
        onClick={onCta}
        style={{
          marginTop: 4,
          background: theme.primary,
          color: 'white',
          border: 'none',
          borderRadius: 16,
          padding: '14px 24px',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          boxShadow: theme.buttonShadow,
          width: '100%',
          maxWidth: 280,
        }}
      >
        {ctaLabel}
      </button>

      {secondaryCtaLabel && onSecondaryCta ? (
        <button
          type="button"
          onClick={onSecondaryCta}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6e6e73',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          {secondaryCtaLabel}
        </button>
      ) : null}
    </div>
  );
}
