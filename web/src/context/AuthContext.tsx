import React from "react";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

import { apiFetch } from "../lib/api";
import { syncUserTypeFromRole } from "../theme/app-theme";
import {
  loadFavoritesFromServer,
  syncLocalFavoritesToServer,
} from "../lib/favorites-storage";
import { AUTH_SESSION_READY_EVENT } from "../lib/location-preferences";
import { identifyUser, resetUser, trackEvent } from "../lib/analytics";
import { AnalyticsEvents } from "../lib/analytics-events";



type User = {

  id: string;



  email: string;



  role: string;



  profile?: {

    id: string;



    first_name?: string | null;

    last_name?: string | null;



    avatar_url?: string | null;



    phone?: string | null;



    location?: string | null;



    address?: string | null;



    dni?: string | null;



    birth_date?: string | null;



    bio?: string | null;



    nationality?: string | null;



    cuit_cuil?: string | null;



    created_at?: string | null;

    // Agent reputation stats (only present for AGENT role)
    average_rating?: number | null;
    total_reviews?: number | null;
    total_worked_properties?: number | null;
    active_properties?: number | null;
    completed_properties?: number | null;

  };

};



type AuthContextType = {

  user: User | null;

  accessToken: string | null;

  refreshToken: string | null;

  isHydrating: boolean;

  login: (accessToken: string, refreshToken: string, user: User) => void;

  logout: () => void;

  refreshUser: () => Promise<void>;

};



const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null);



  const [accessToken, setAccessToken] = useState<string | null>(null);



  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const [isHydrating, setIsHydrating] = useState(true);



  const refreshUser = useCallback(async () => {

    const response = await apiFetch("/auth/me");



    if (response?.data) {

      setUser(response.data);

      syncUserTypeFromRole(response.data.role);

      identifyUser(response.data.id, { role: response.data.role, email: response.data.email });

    }

  }, []);



  useEffect(() => {

    async function hydrateAuth() {

      const storedAccessToken = localStorage.getItem("accessToken");



      const storedRefreshToken = localStorage.getItem("refreshToken");



      if (!storedAccessToken || !storedRefreshToken) {
        setIsHydrating(false);
        return;
      }



      setAccessToken(storedAccessToken);



      setRefreshToken(storedRefreshToken);



      try {

        await refreshUser();

        void loadFavoritesFromServer();
        window.dispatchEvent(new Event(AUTH_SESSION_READY_EVENT));

      } catch (error) {

        console.error(error);



        localStorage.removeItem("accessToken");



        localStorage.removeItem("refreshToken");



        setAccessToken(null);



        setRefreshToken(null);



        setUser(null);

      } finally {
        setIsHydrating(false);
      }
    }

    hydrateAuth();
  }, [refreshUser]);



  function login(accessToken: string, refreshToken: string, user: User) {

    localStorage.setItem("accessToken", accessToken);



    localStorage.setItem("refreshToken", refreshToken);



    setAccessToken(accessToken);



    setRefreshToken(refreshToken);



    setUser(user);

    syncUserTypeFromRole(user.role);

    identifyUser(user.id, { role: user.role, email: user.email });
    trackEvent(AnalyticsEvents.AUTH_LOGIN, { role: user.role });

    void syncLocalFavoritesToServer();
    window.dispatchEvent(new Event(AUTH_SESSION_READY_EVENT));

  }



  function logout() {

    trackEvent(AnalyticsEvents.AUTH_LOGOUT);
    resetUser();

    localStorage.removeItem("accessToken");



    localStorage.removeItem("refreshToken");



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

        isHydrating,

        login,

        logout,

        refreshUser,

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}



export function useAuth() {

  const context = useContext(AuthContext);



  if (!context) {

    throw new Error("useAuth must be used inside AuthProvider");

  }



  return context;

}

