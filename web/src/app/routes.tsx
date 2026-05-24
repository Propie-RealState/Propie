import { createBrowserRouter, Outlet } from "react-router-dom";
import React, { lazy, Suspense } from "react";
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
import RegisterClient from "./pages/RegisterClient";
import RegisterClientInfo from "./pages/RegisterClientInfo";
import { PublisherRoute } from "../components/auth/PublisherRoute";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import Favorites from "./modules/favorites/pages/Favorites";

import PublishStep1 from "./modules/publish/pages/PublishStep1";
import PublishStep2 from "./modules/publish/pages/PublishStep2";
import PublishStep3 from "./modules/publish/pages/PublishStep3";
import PublishStep4 from "./modules/publish/pages/PublishStep4";
import PublishStep5 from "./modules/publish/pages/PublishStep5";

import PropertyDetails from "./modules/explore/pages/PropertyDetails";
import EditProperty from "./modules/explore/pages/EditProperty";

import Share from "./pages/Share";
import Profile from "./modules/profile/pages/Profile.tsx";
import { PropertyPublishProvider } from "./modules/publish/context/PropertyPublishContext";
import MyProperties from "./modules/my-properties/pages/MyProperties";
import Messages from "./modules/agent-applications/pages/Messages";
import Notifications from "./modules/agent-applications/pages/Notifications";

const PropertyMap = lazy(
  () => import("./modules/map/pages/PropertyMap")
);

function MapRoute() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height:
              "100dvh",
            display:
              "grid",
            placeItems:
              "center",
            background:
              "#f5f5f7",
            color:
              "#141414",
            fontFamily:
              "'Inter', sans-serif",
            fontWeight:
              800,
          }}
        >
          Cargando mapa...
        </div>
      }
    >
      <PropertyMap />
    </Suspense>
  );
}
export const router =
  createBrowserRouter([
    {
      path: "/",
    
      element: (
        <PropertyPublishProvider>
          <Root />
        </PropertyPublishProvider>
      ),
    
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
          path: "mapa",
          Component: MapRoute,
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
              path: "client",
              Component: RegisterClient,
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

            {
              path: "client-info",
              Component: RegisterClientInfo,
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
          element: (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          ),
        },

        {
          path: "favoritos",
          element: (
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          ),
        },

        {
          path: "mensajes",
          element: (
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          ),
        },

        {
          path: "notificaciones",
          element: (
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          ),
        },

        {
          path: "mis-propiedades",
          element: (
            <PublisherRoute>
              <MyProperties />
            </PublisherRoute>
          ),
        },
        {
          path: "/mis-propiedades/:id/editar",
          element: (
            <PublisherRoute>
              <EditProperty />
            </PublisherRoute>
          ),
        },
        {
          path: "/publicar",
          element: (
            <PublisherRoute>
              <Outlet />
            </PublisherRoute>
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
