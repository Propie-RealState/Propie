import { createBrowserRouter, Outlet } from "react-router-dom";
import React from "react";
import { Root } from "./Root";
import { RegisterProvider } from "../context/RegisterContext";

import Home from "./pages/Home";
import Explore from "./modules/explore/pages/Explore.tsx";
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

import PublishStep1 from "./modules/publish/pages/PublishStep1";
import PublishStep2 from "./modules/publish/pages/PublishStep2";
import PublishStep3 from "./modules/publish/pages/PublishStep3";
import PublishStep4 from "./modules/publish/pages/PublishStep4";
import PublishStep5 from "./modules/publish/pages/PublishStep5";

import PropertyDetails from "./modules/explore/pages/PropertyDetails";
import EditProperty from "./modules/explore/pages/EditProperty";

import Share from "./pages/Share";
import Profile from "./pages/Profile";
import { PropertyPublishProvider } from "./modules/publish/context/PropertyPublishContext";
import MyProperties from "./modules/my-properties/pages/MyProperties";

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
          path: "perfil",
          Component: Profile,
        },

        {
          path: "mis-propiedades",
          Component: MyProperties,
        },
        {
          path: "/mis-propiedades/:id/editar",
          element: (
            <PropertyPublishProvider>
              <EditProperty />
            </PropertyPublishProvider>
          ),
        },
        {
          path: "/publicar",
        
          element: (
            <PropertyPublishProvider>
              <Outlet />
            </PropertyPublishProvider>
          ),
        
          children: [
            {
              index: true,
              element: <PublishStep1 />,
            },
        
            {
              path: "fotos-videos",
              element: <PublishStep2 />,
            },
        
            {
              path: "informacion",
              element: <PublishStep3 />,
            },
            {
              path: "comercializacion",
              element: <PublishStep4 />,
            },
            {
              path: "revision",
              element: <PublishStep5 />,
            },
          ],
        }
      ],
    },
  ]);

