import React from "react";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

import { apiFetch } from "../lib/api";
import { syncUserTypeFromRole } from "../theme/app-theme";
import {
  loadFavoritesFromServer,
  syncLocalFavoritesToServer,
} from "../lib/favorites-storage";
import { AUTH_SESSION_READY_EVENT } from "../lib/location-preferences";
import { clearLegacyBannerDismissStorage, clearAgentBannerSnoozeForSession, hadLegacyPermanentBannerDismiss } from "../lib/agent-profile-completion";
import { dismissAgentProfileBanner } from "../app/modules/profile/services/profile.service";



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

    experience?: unknown;
    certifications?: unknown;
    education?: unknown;
    agent_profile_banner_dismissed?: boolean;

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
      migrateLegacyPermanentBannerDismiss(response.data);
    }
  }, []);

  function migrateLegacyPermanentBannerDismiss(sessionUser: User) {
    if (sessionUser.role !== "AGENT") {
      clearLegacyBannerDismissStorage();
      return;
    }

    if (sessionUser.profile?.agent_profile_banner_dismissed) {
      clearLegacyBannerDismissStorage();
      return;
    }

    if (!hadLegacyPermanentBannerDismiss()) {
      return;
    }

    clearLegacyBannerDismissStorage();
    void dismissAgentProfileBanner()
      .then(() => refreshUser())
      .catch(() => undefined);
  }

  function beginAgentSession(user: User) {
    clearAgentBannerSnoozeForSession(user.id);
  }



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

    if (user.role === "AGENT") {
      beginAgentSession(user);
      migrateLegacyPermanentBannerDismiss(user);
    } else {
      clearLegacyBannerDismissStorage();
    }
    syncUserTypeFromRole(user.role);

    void syncLocalFavoritesToServer();
    window.dispatchEvent(new Event(AUTH_SESSION_READY_EVENT));

  }



  function logout() {
    if (user?.role === "AGENT") {
      clearAgentBannerSnoozeForSession(user.id);
    }

    localStorage.removeItem("accessToken");



    localStorage.removeItem("refreshToken");



    setAccessToken(null);



    setRefreshToken(null);



    setUser(null);

    sessionStorage.removeItem("userType");

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

