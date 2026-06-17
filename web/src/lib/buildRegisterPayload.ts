import type { RegisterData, RegisterRole } from '../../context/RegisterContext';

type MainGoal = 'PUBLISH' | 'EXPLORE';

function deriveNamesFromEmail(email: string): { firstName: string; lastName: string } {
  const emailLocal = email.split('@')[0] ?? 'usuario';
  const nameParts = emailLocal.replace(/[._-]/g, ' ').split(/\s+/).filter(Boolean);

  const firstName = nameParts[0]
    ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)
    : 'Usuario';
  const lastName = nameParts[1]
    ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
    : 'Nuevo';

  return { firstName, lastName };
}

/**
 * Minimal registration body for the streamlined 3-step onboarding flow.
 */
export function buildMinimalRegisterPayload(
  data: RegisterData,
  role: RegisterRole | 'CLIENT',
  mainGoal: MainGoal,
) {
  const derived = deriveNamesFromEmail(data.email);

  return {
    role,
    firstName: data.firstName.trim() || derived.firstName,
    lastName: data.lastName.trim() || derived.lastName,
    email: data.email,
    password: data.password,
    birthDate: data.birthDate || undefined,
    nationality: data.nationality || undefined,
    bio: data.bio || undefined,
    mainGoal,
  };
}

/**
 * @deprecated Use buildMinimalRegisterPayload for new registrations.
 */
export function buildRegisterPayload(
  data: RegisterData,
  role: RegisterRole | 'CLIENT',
  mainGoal: MainGoal = 'EXPLORE',
) {
  const derived = deriveNamesFromEmail(data.email);

  return {
    role,
    firstName: data.firstName.trim() || derived.firstName,
    lastName: data.lastName.trim() || derived.lastName,
    email: data.email,
    password: data.password,
    dni: data.dni || undefined,
    birthDate: data.birthDate || undefined,
    nationality: data.nationality || undefined,
    cuitCuil: data.cuitCuil || undefined,
    address: data.address || undefined,
    location: data.location || data.address || undefined,
    phone: data.recoveryPhone || undefined,
    bio: data.bio || undefined,
    mainGoal,
  };
}
