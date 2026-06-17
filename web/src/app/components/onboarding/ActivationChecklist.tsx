import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React from 'react';

import type { ActivationStep } from '../../../lib/onboarding/activation';
import { getActivationProgress } from '../../../lib/onboarding/activation';
import { useAppTheme } from '../../../theme/useAppTheme';

type Props = {
  title: string;
  subtitle: string;
  steps: ActivationStep[];
};

export function ActivationChecklist({ title, subtitle, steps }: Props) {
  const navigate = useNavigate();
  const theme = useAppTheme();
  const progress = getActivationProgress(steps);

  if (progress.percent === 100) {
    return null;
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 20,
        border: '1px solid #ececf0',
        padding: '18px 18px 10px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 800,
              color: '#1a1a1a',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {title}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6e6e73', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: theme.primary,
            whiteSpace: 'nowrap',
          }}
        >
          {progress.completed}/{progress.total}
        </span>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: '#f0f0f2',
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress.percent}%`,
            background: theme.primary,
            borderRadius: 999,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '10px 4px',
              borderTop: step.id === steps[0]?.id ? 'none' : '1px solid #f2f2f4',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                flexShrink: 0,
                background: step.completed ? theme.primary : '#f0f0f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
              }}
            >
              {step.completed ? (
                <Check size={14} color="white" strokeWidth={3} />
              ) : null}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: step.completed ? '#9a9aa0' : '#1a1a1a',
                  textDecoration: step.completed ? 'line-through' : 'none',
                }}
              >
                {step.label}
              </p>
              {!step.completed ? (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6e6e73', lineHeight: 1.5 }}>
                  {step.description}
                </p>
              ) : null}
            </div>

            {!step.completed && step.href && step.ctaLabel ? (
              <button
                type="button"
                onClick={() => navigate(step.href!)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  background: theme.lightBgSolid,
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: theme.primary,
                  cursor: 'pointer',
                }}
              >
                {step.ctaLabel}
                <ChevronRight size={14} />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
