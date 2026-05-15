import React from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiFetch } from "../lib/api";

type User = {
  id: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;

  accessToken: string | null;

  refreshToken: string | null;

  login: (
    accessToken: string,
    refreshToken: string,
    user: User
  ) => void;

  logout: () => void;
};

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [refreshToken, setRefreshToken] =
    useState<string | null>(null);


  useEffect(() => {

    async function hydrateAuth() {

      const storedAccessToken =
        localStorage.getItem(
          "accessToken"
        );

      const storedRefreshToken =
        localStorage.getItem(
          "refreshToken"
        );

      // ================================================
      // NO TOKENS
      // ================================================

      if (
        !storedAccessToken ||
        !storedRefreshToken
      ) {
        return;
      }

      // ================================================
      // RESTORE TOKENS
      // ================================================

      setAccessToken(
        storedAccessToken
      );

      setRefreshToken(
        storedRefreshToken
      );

      try {

        // ==============================================
        // GET REAL USER
        // ==============================================

        const response =
          await apiFetch(
            "/auth/me"
          );

        // ==============================================
        // HYDRATE REAL USER
        // ==============================================

        setUser(
          response.data
        );

      } catch (error) {

        console.error(error);

        // ==============================================
        // INVALID TOKEN
        // ==============================================

        localStorage.removeItem(
          "accessToken"
        );

        localStorage.removeItem(
          "refreshToken"
          );

        setAccessToken(null);

        setRefreshToken(null);

        setUser(null);
      }
    }

    hydrateAuth();

  }, []);



  // ====================================================
  // LOGIN
  // ====================================================

  function login(
    accessToken: string,
    refreshToken: string,
    user: User
  ) {

    localStorage.setItem(
      'accessToken',
      accessToken
    );

    localStorage.setItem(
      'refreshToken',
      refreshToken
    );

    setAccessToken(
      accessToken
    );

    setRefreshToken(
      refreshToken
    );

    setUser(user);
  }

  // ====================================================
  // LOGOUT
  // ====================================================

  function logout() {

    localStorage.removeItem(
      'accessToken'
    );

    localStorage.removeItem(  
      'refreshToken'
    );

    setAccessToken(null);

    setRefreshToken(null);

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}

