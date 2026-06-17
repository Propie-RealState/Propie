import type { NavigateFunction } from 'react-router-dom';

import type { AppUserRole } from '../roles';
import { getLastViewedPropertyPath } from './last-viewed-property';
import { markOnboardingComplete } from './activation';

export function getPostAuthPath(role: AppUserRole | string): string {
  switch (role) {
    case 'CLIENT':
      return getLastViewedPropertyPath() ?? '/favoritos';
    case 'OWNER':
      return '/explore';
    case 'AGENT':
      return '/explore';
    default:
      return '/explore';
  }
}

export function navigateAfterAuth(
  role: AppUserRole | string,
  navigate: NavigateFunction,
  options?: { replace?: boolean },
): void {
  markOnboardingComplete(role);
  navigate(getPostAuthPath(role), { replace: options?.replace ?? true });
}
