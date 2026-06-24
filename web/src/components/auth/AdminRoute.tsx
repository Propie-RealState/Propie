import { Navigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { isAdminRole } from '../../lib/roles';

/**
 * Internal-only route guard. ADMIN cannot be obtained via registration UI.
 */
export function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isHydrating } = useAuth();

  if (isHydrating) {
    return null;
  }

  if (!user) {
    return (
      <Navigate
        to="/explorar"
        replace
      />
    );
  }

  if (!isAdminRole(user.role)) {
    return (
      <Navigate
        to="/explorar"
        replace
      />
    );
  }

  return children;
}
