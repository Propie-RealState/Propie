import React from "react";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

import { apiFetch } from "../lib/api";
import { syncUserTypeFromRole } from "../theme/app-theme";



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



  login: (accessToken: string, refreshToken: string, user: User) => void;



  logout: () => void;



  refreshUser: () => Promise<void>;

};



const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null);



  const [accessToken, setAccessToken] = useState<string | null>(null);



  const [refreshToken, setRefreshToken] = useState<string | null>(null);



  const refreshUser = useCallback(async () => {

    const response = await apiFetch("/auth/me");



    if (response?.data) {

      setUser(response.data);

      syncUserTypeFromRole(response.data.role);

    }

  }, []);



  useEffect(() => {

    async function hydrateAuth() {

      const storedAccessToken = localStorage.getItem("accessToken");



      const storedRefreshToken = localStorage.getItem("refreshToken");



      if (!storedAccessToken || !storedRefreshToken) {

        return;

      }



      setAccessToken(storedAccessToken);



      setRefreshToken(storedRefreshToken);



      try {

        await refreshUser();

      } catch (error) {

        console.error(error);



        localStorage.removeItem("accessToken");



        localStorage.removeItem("refreshToken");



        setAccessToken(null);



        setRefreshToken(null);



        setUser(null);

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

  }



  function logout() {

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

