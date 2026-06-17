import type { AppUserRole } from '../roles';
import { getFavoriteIds } from '../favorites-storage';

export type ActivationStep = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  href?: string;
  ctaLabel?: string;
};

const ONBOARDING_KEY = 'propie_onboarding_complete';

function storageKey(userId: string, suffix: string): string {
  return `propie_activation_${userId}_${suffix}`;
}

export function markOnboardingComplete(role: AppUserRole | string): void {
  try {
    sessionStorage.setItem(ONBOARDING_KEY, role);
  } catch {
    // ignore
  }
}

export function wasOnboardingJustCompleted(): boolean {
  try {
    return Boolean(sessionStorage.getItem(ONBOARDING_KEY));
  } catch {
    return false;
  }
}

export function clearOnboardingFlag(): void {
  try {
    sessionStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // ignore
  }
}

export function markActivationEvent(userId: string, event: string): void {
  try {
    localStorage.setItem(storageKey(userId, event), '1');
  } catch {
    // ignore
  }
}

export function hasActivationEvent(userId: string, event: string): boolean {
  try {
    return localStorage.getItem(storageKey(userId, event)) === '1';
  } catch {
    return false;
  }
}

export function getClientActivationSteps(
  userId: string,
  hasFavorites: boolean,
): ActivationStep[] {
  const favorited =
    hasFavorites ||
    hasActivationEvent(userId, 'first_favorite') ||
    getFavoriteIds().length > 0;

  return [
    {
      id: 'account',
      label: 'Crear cuenta',
      description: 'Ya tenés acceso a explorar y contactar.',
      completed: true,
    },
    {
      id: 'favorite',
      label: 'Guardar tu primera propiedad',
      description: 'Marcá favoritos para comparar opciones y retomar después.',
      completed: favorited,
      href: '/explore',
      ctaLabel: 'Explorar propiedades',
    },
    {
      id: 'contact',
      label: 'Contactar un publicador',
      description: 'Escribí por chat y coordiná una visita cuando quieras.',
      completed: hasActivationEvent(userId, 'first_message'),
      href: '/explore',
      ctaLabel: 'Ver propiedades',
    },
    {
      id: 'visit',
      label: 'Agendar una visita',
      description: 'Coordiná fecha y hora desde la conversación.',
      completed: hasActivationEvent(userId, 'first_visit'),
      href: '/visitas',
      ctaLabel: 'Ver mis visitas',
    },
  ];
}

export function getOwnerActivationSteps(
  userId: string,
  publishedCount: number,
): ActivationStep[] {
  const published =
    publishedCount > 0 || hasActivationEvent(userId, 'first_publish');

  return [
    {
      id: 'account',
      label: 'Crear cuenta',
      description: 'Tu perfil de propietario está listo.',
      completed: true,
    },
    {
      id: 'publish',
      label: 'Publicar tu primera propiedad',
      description: 'Subí fotos, definí precio y empezá a recibir consultas.',
      completed: published,
      href: '/publicar',
      ctaLabel: 'Publicar ahora',
    },
    {
      id: 'message',
      label: 'Responder tu primera consulta',
      description: 'Las consultas llegan a Mensajes en tiempo real.',
      completed: hasActivationEvent(userId, 'first_inquiry'),
      href: '/mensajes',
      ctaLabel: 'Ir a mensajes',
    },
  ];
}

export function getAgentActivationSteps(
  userId: string,
  assignedCount: number,
): ActivationStep[] {
  const profileComplete = hasActivationEvent(userId, 'profile_complete');
  const hasAssignment =
    assignedCount > 0 || hasActivationEvent(userId, 'first_assignment');

  return [
    {
      id: 'account',
      label: 'Crear cuenta',
      description: 'Tu perfil de agente está activo.',
      completed: true,
    },
    {
      id: 'profile',
      label: 'Completar perfil profesional',
      description: 'Sumá experiencia y certificaciones para destacar.',
      completed: profileComplete,
      href: '/perfil',
      ctaLabel: 'Completar perfil',
    },
    {
      id: 'apply',
      label: 'Solicitar tu primera propiedad',
      description: 'Encontrá avisos que buscan agente y enviá tu solicitud.',
      completed: hasActivationEvent(userId, 'first_application'),
      href: '/explore',
      ctaLabel: 'Buscar propiedades',
    },
    {
      id: 'assignment',
      label: 'Conseguir una asignación',
      description: 'Cuando un propietario apruebe, gestionás desde Mis Propiedades.',
      completed: hasAssignment,
      href: '/mis-propiedades',
      ctaLabel: 'Ver mis propiedades',
    },
  ];
}

export function getActivationProgress(steps: ActivationStep[]): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = steps.length;
  const completed = steps.filter((step) => step.completed).length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
