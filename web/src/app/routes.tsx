import { createBrowserRouter, Outlet } from "react-router-dom";
import React from "react";
import { Root } from "./Root";
import { RegisterProvider } from "../context/RegisterContext";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Login from "./pages/Login";

import RegisterChoice from "./pages/RegisterChoice";
import RegisterPropie from "./pages/RegisterDueño";
import RegisterAgente from "./pages/RegisterAgente";
import RegisterVerification from "./pages/RegisterVerification";
import RegisterPersonalData from "./pages/RegisterPersonalData";
import RegisterSecurity from "./pages/RegisterSecurity";
import RegisterProfilePhoto from "./pages/RegisterProfilePhoto";
import RegisterOwnerInfo from "./pages/RegisterOwnerInfo";
import RegisterAgentInfo from "./pages/RegisterAgentInfo";

import PublishStep1 from "./pages/PublishStep1";
import PublishStep2 from "./pages/PublishStep2";
import PublishStep3 from "./pages/PublishStep3";
import PublishStep4 from "./pages/PublishStep4";
import PublishStep5 from "./pages/PublishStep5";

import PropertyDetails from "./pages/PropertyDetails";
import Share from "./pages/Share";

export const router =
  createBrowserRouter([
    {
      path: "/",

      Component: Root,

      children: [

        // ==================================================
        // PUBLIC
        // ==================================================

        {
          index: true,
          Component: Home,
        },

        {
          path: "explorar",
          Component: Explore,
        },

        {
          path: "ingresar",
          Component: Login,
        },

        {
          path: "registro",
          element: (
            <RegisterProvider>
              <Outlet />
            </RegisterProvider>
          ),
          children: [
            {
              index: true,
              Component: RegisterChoice,
            },
        
            {
              path: "owner",
              Component: RegisterPropie,
            },
        
            {
              path: "agent",
              Component: RegisterAgente,
            },
        
            {
              path: "verification",
              Component: RegisterVerification,
            },
        
            {
              path: "personal-data",
              Component: RegisterPersonalData,
            },
        
            {
              path: "security",
              Component: RegisterSecurity,
            },
        
            {
              path: "profile-photo",
              Component: RegisterProfilePhoto,
            },
        
            {
              path: "owner-info",
              Component: RegisterOwnerInfo,
            },
        
            {
              path: "agent-info",
              Component: RegisterAgentInfo,
            },
          ],
        },

        {
          path: "propiedad/:id",
          Component: PropertyDetails,
        },

        {
          path: "compartir/:id",
          Component: Share,
        },



        // ==================================================
        // PROTECTED
        // ==================================================

        {
          path: "publicar",

          element: (
            <ProtectedRoute>
              <PublishStep1 />
            </ProtectedRoute>
          ),
        },

        {
          path: "publicar/fotos-videos",

          element: (
            <ProtectedRoute>
              <PublishStep2 />
            </ProtectedRoute>
          ),
        },

        {
          path: "publicar/informacion",

          element: (
            <ProtectedRoute>
              <PublishStep3 />
            </ProtectedRoute>
          ),
        },

        {
          path: "publicar/comercializacion",

          element: (
            <ProtectedRoute>
              <PublishStep4 />
            </ProtectedRoute>
          ),
        },

        {
          path: "publicar/verificacion",

          element: (
            <ProtectedRoute>
              <PublishStep5 />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);

