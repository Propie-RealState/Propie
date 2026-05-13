import { createContext, useContext, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

export interface AuthContextValue {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

const AuthStateContext = createContext<AuthContextValue | null>(null);

/** Auth compartido por todas las rutas bajo `Root` (más fiable que `useOutletContext` con el data router). */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthStateContext);
  if (!ctx) {
    return { isLoggedIn: false, setIsLoggedIn: () => {} };
  }
  return ctx;
}

export function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const value = useMemo(() => ({ isLoggedIn, setIsLoggedIn }), [isLoggedIn]);

  return (
    <AuthStateContext.Provider value={value}>
      <Outlet />
    </AuthStateContext.Provider>
  );
}
