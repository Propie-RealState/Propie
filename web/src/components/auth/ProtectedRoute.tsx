import {
  Navigate,
} from "react-router-dom";
import React from "react";
import {
  useAuth,
} from "../../context/AuthContext";

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, isHydrating } =
    useAuth();

  if (isHydrating) {
    return null;
  }

  // ====================================================
  // NOT AUTHENTICATED
  // ====================================================

  if (!user) {

    return (
      <Navigate
        to="/ingresar"
        replace
      />
    );
  }

  // ====================================================
  // AUTHENTICATED
  // ====================================================

  return children;
}

