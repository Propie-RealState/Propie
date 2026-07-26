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
import {
  CharCounter,
  FieldError,
  ValidationSummary,
  type FieldErrors,
  validateBio,
  buildRegistrationContext,
  ensureRegistrationReady,
  getRegisterSubmitErrorMessage,
  handleRegisterValidationFailure,
  navigateWithRegisterErrors,
  useRegisterRedirectErrors,
} from '../../features/register/validation';
import { continueRegistrationAfterSignup } from '../../features/register/continue-registration-after-signup';
import { trackEvent } from '../../lib/analytics';
import { AnalyticsEvents } from '../../lib/analytics-events';

export default function RegisterClientInfo() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data, updateData, reset } = useRegister();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [bioApiError, setBioApiError] = useState<string | undefined>();
  const seedFieldErrors = useCallback((errors: FieldErrors) => {
    if (errors.bio) setBioApiError(errors.bio);
  }, []);
  const { formError, showFinalSubmitNotice } =
    useRegisterRedirectErrors(seedFieldErrors);

  const theme = REGISTER_COMPLETION.OWNER;

  const handleFinalizar = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      const registrationContext = buildRegistrationContext(data, {
        profilePhoto: getPendingAvatarFile(),
      });
      const readiness = ensureRegistrationReady(data, registrationContext);
      if (!readiness.valid) {
        navigateWithRegisterErrors(navigate, readiness.route, {
          registerFieldErrors: readiness.errors,
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

      if (!response?.data?.requiresVerification || !response?.data?.email) {
        throw new Error('INVALID_REGISTER_RESPONSE');
      }

      trackEvent(AnalyticsEvents.AUTH_SIGNUP, { role: 'CLIENT' });

      await continueRegistrationAfterSignup(auth, data, {
        onVerificationRequired: () => navigate('/registro/verification'),
        onSignupComplete: () => setShowSuccess(true),
      });
    } catch (error) {
      if (!handleRegisterValidationFailure(error, data, navigate)) {
        setSubmitError(getRegisterSubmitErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessFinish = useCallback(() => {
    setShowSuccess(false);
    reset();
    navigate('/explorar', { replace: true });
  }, [navigate, reset]);

  const charCount = data.bio.length;
  const maxChars = 300;
  const bioError = bioApiError || validateBio(data.bio).error;
  const visibleFormError = submitError || formError;

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
        {showFinalSubmitNotice && (
          <div
            role="status"
            style={{
              background: 'linear-gradient(135deg, #fff4f4 0%, #ffe8e8 100%)',
              border: '1.5px solid #f5c2c7',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 16,
              fontSize: 14,
              color: '#8b1e1e',
              lineHeight: 1.5,
            }}
          >
            Revisá los datos marcados para poder crear tu cuenta.
          </div>
        )}
        {visibleFormError && (
          <div style={{ marginBottom: 16 }}>
            <ValidationSummary errors={[visibleFormError]} />
          </div>
        )}
        <label
          htmlFor="bio"
          style={{ fontSize: 13, fontWeight: 600, color: '#3a3a3c' }}
        >
          Bio (opcional)
        </label>
        <textarea
          id="bio"
          value={data.bio}
          onChange={(event) => {
            setBioApiError(undefined);
            updateData({ bio: event.target.value });
          }}
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
