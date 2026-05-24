import type {
  RegisterData,
  RegisterRole,
} from '../context/RegisterContext';

type MainGoal = 'PUBLISH' | 'EXPLORE';

/**
 * Cuerpo limpio para POST /auth/register (solo campos del schema).
 */
export function buildRegisterPayload(
  data: RegisterData,
  role: RegisterRole | 'CLIENT',
  mainGoal: MainGoal = 'EXPLORE'
) {
  return {
    role,

    firstName: data.firstName,

    lastName: data.lastName,

    email: data.email,

    password: data.password,

    dni: data.dni,

    birthDate: data.birthDate,

    nationality: data.nationality,

    cuitCuil: data.cuitCuil,

    address: data.address,

    location: data.location || data.address,

    phone: data.recoveryPhone || undefined,

    bio: data.bio || undefined,

    mainGoal,

    profilePhoto: data.profilePhoto ?? null,
  };
}
