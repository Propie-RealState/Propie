import type { RegisterData, RegisterRole } from '../../../context/RegisterContext';
import { apiFetch } from '../../../lib/api';
import { buildMinimalRegisterPayload } from '../../../lib/buildRegisterPayload';
import { markOnboardingComplete } from '../../../lib/onboarding/activation';
import { uploadAvatar } from '../../../app/modules/profile/services/upload-avatar.service';

export type CompleteRegistrationResult = {
  role: RegisterRole;
  user: { id: string; role: string; email: string };
};

function mainGoalForRole(role: RegisterRole): 'PUBLISH' | 'EXPLORE' {
  if (role === 'OWNER') return 'PUBLISH';
  return 'EXPLORE';
}

async function maybeUploadProfilePhoto(profilePhoto: string | null) {
  if (!profilePhoto?.startsWith('data:')) return;
  const response = await fetch(profilePhoto);
  const blob = await response.blob();
  const file = new File([blob], 'profile-photo.jpg', { type: blob.type || 'image/jpeg' });
  await uploadAvatar(file);
}

export async function completeRegistration(
  data: RegisterData,
  auth: {
    login: (accessToken: string, refreshToken: string, user: CompleteRegistrationResult['user']) => void;
  },
): Promise<CompleteRegistrationResult> {
  if (!data.role) {
    throw new Error('REGISTER_ROLE_MISSING');
  }

  const role = data.role;
  const mainGoal = mainGoalForRole(role);
  const payload = buildMinimalRegisterPayload(data, role, mainGoal);

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

  auth.login(authData.accessToken, authData.refreshToken, authData.user);

  try {
    await maybeUploadProfilePhoto(data.profilePhoto);
  } catch (error) {
    console.warn('Profile photo upload failed', error);
  }

  if (role === 'OWNER') {
    sessionStorage.setItem('userType', 'propie');
  } else if (role === 'AGENT') {
    sessionStorage.setItem('userType', 'agente');
  } else {
    sessionStorage.removeItem('userType');
  }

  markOnboardingComplete(role);

  return { role, user: authData.user };
}
