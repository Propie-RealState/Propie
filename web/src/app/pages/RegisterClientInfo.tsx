import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import React from 'react';
import { AuthHeroHeader } from '../components/AuthHeroHeader';
import { RegisterSuccessOverlay } from '../components/register/RegisterSuccessOverlay';
import { REGISTER_COMPLETION } from '../components/register/registerCompletionTheme';
import { useRegister } from '../../context/RegisterContext';
import { apiFetch } from '../../lib/api';
import { buildRegisterPayload } from '../../lib/buildRegisterPayload';
import { useAuth } from '../../context/AuthContext';
import { getPendingAvatarFile, clearPendingAvatarFile } from '../../lib/pending-avatar';
import { uploadAvatar } from '../modules/profile/services/upload-avatar.service';
import { CharCounter, FieldError, validateBio, buildRegistrationContext, ensureRegistrationReady, handleRegisterValidationFailure } from '../../features/register/validation';

export default function RegisterClientInfo() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data, updateData, reset } = useRegister();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = REGISTER_COMPLETION.OWNER;

  const handleFinalizar = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationContext = buildRegistrationContext(data, {
        profilePhoto: getPendingAvatarFile(),
      });
      const readiness = ensureRegistrationReady(data, registrationContext);
      if (!readiness.valid) {
        navigate(readiness.route, {
          state: { registerFieldErrors: readiness.errors, fromFinalSubmit: true },
        });
        return;
      }

      updateData({
        mainGoal: 'EXPLORE',
      });

      const payload = buildRegisterPayload(
        {
          ...data,
          mainGoal: 'EXPLORE',
        },
        'CLIENT',
        'EXPLORE',
      );

      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const authData = response?.data;

      if (
        !authData?.accessToken ||
        !authData?.refreshToken ||
        !authData?.user
      ) {
        throw new Error('INVALID_REGISTER_RESPONSE');
      }

      auth.login(
        authData.accessToken,
        authData.refreshToken,
        authData.user,
      );

      sessionStorage.removeItem('userType');

      const pendingAvatar = getPendingAvatarFile();
      if (pendingAvatar) {
        try {
          await uploadAvatar(pendingAvatar);
        } catch {
          // Non-fatal: avatar upload failure should not block registration completion.
        } finally {
          clearPendingAvatarFile();
        }
      }

      reset();

      setShowSuccess(true);
    } catch (error) {
      if (!handleRegisterValidationFailure(error, data, navigate)) {
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessFinish = useCallback(() => {
    setShowSuccess(false);
    navigate('/explore', { replace: true });
  }, [navigate]);

  const charCount = data.bio.length;
  const maxChars = 300;
  const bioError = validateBio(data.bio).error;

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f7',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          position: 'relative',
          background: theme.gradient,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: 0,
        }}
      >
        <AuthHeroHeader />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '28px 28px 12px',
          }}
        >
          <h1
            style={{
              color: 'white',
              fontSize: 'clamp(24px, 6vw, 30px)',
              fontWeight: 800,
              letterSpacing: '-1px',
              lineHeight: 1.2,
              fontFamily: "'Sora', sans-serif",
              margin: 0,
            }}
          >
            Contanos un poco sobre vos
          </h1>
        </div>

      </div>

      <div style={{ flex: 1, padding: '8px 24px 32px', maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <label
          htmlFor="client-bio"
          style={{ fontSize: 13, fontWeight: 600, color: '#3a3a3c' }}
        >
          Bio (opcional)
        </label>
        <textarea
          id="client-bio"
          value={data.bio}
          onChange={(event) => updateData({ bio: event.target.value })}
          maxLength={maxChars}
          placeholder="¿Qué estás buscando?"
          rows={5}
          style={{
            width: '100%',
            marginTop: 8,
            borderRadius: 16,
            border: '1.5px solid #e5e5ea',
            padding: '14px 16px',
            fontSize: 15,
            resize: 'vertical',
            fontFamily: "'Inter', sans-serif",
            boxSizing: 'border-box',
          }}
        />
        <p style={{ textAlign: 'right', fontSize: 12, color: '#9a9aa0', marginTop: 6 }}>
          <CharCounter current={charCount} max={maxChars} />
        </p>
        <FieldError message={bioError} />

        <button
          type="button"
          onClick={handleFinalizar}
          disabled={isSubmitting}
          style={{
            width: '100%',
            marginTop: 24,
            padding: '16px 0',
            borderRadius: 18,
            border: 'none',
            cursor: isSubmitting ? 'wait' : 'pointer',
            background: theme.primary,
            color: 'white',
            fontSize: 16,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: theme.buttonShadow,
          }}
        >
          <Check size={18} />
          {isSubmitting ? 'Creando cuenta...' : 'Finalizar registro'}
        </button>
      </div>

      <RegisterSuccessOverlay
        open={showSuccess}
        variant="OWNER"
        title="¡Cuenta creada!"
        subtitle="Ya podés explorar, guardar favoritos y contactar publicadores."
        onFinish={handleSuccessFinish}
      />
    </div>
  );
}
