import { Navigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { canPublishProperties } from '../../lib/roles';

/**
 * Blocks CLIENT and guest users from publish / owner listing flows.
 */
export function PublisherRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/ingresar"
        replace
      />
    );
  }

  if (!canPublishProperties(user.role)) {
    return (
      <Navigate
        to="/explorar"
        replace
      />
    );
  }

  return children;
}
