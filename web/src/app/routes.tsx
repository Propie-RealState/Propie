import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { Root } from "./Root";
import { RegisterProvider } from "../context/RegisterContext";
import { RegisterStepLayout } from "./components/register/RegisterStepLayout";

import Explore from "./modules/explore/pages/Explore.tsx";
import Login from "./pages/Login";

import RegisterChoice from "./pages/RegisterChoice";
import RegisterAccount from "./pages/RegisterAccount";
import RegisterBasicProfile from "./pages/RegisterBasicProfile";
import RegisterVerification from "./pages/RegisterVerification";
import RegisterLegacyRedirect from "./pages/RegisterLegacyRedirect";
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
import AgentPublicProfile from "./modules/agents/pages/AgentPublicProfile.tsx";
import UserPublicProfile from "./modules/agents/pages/UserPublicProfile.tsx";
import { PropertyPublishProvider } from "./modules/publish/context/PropertyPublishContext";
import MyProperties from "./modules/my-properties/pages/MyProperties";
import ConversationsInbox from "./modules/property-conversations/pages/ConversationsInbox";
import ConversationThread from "./modules/property-conversations/pages/ConversationThread";
import MyVisits from "./modules/visits/pages/MyVisits";
import VisitDetails from "./modules/visits/pages/VisitDetails";
import Notifications from "./modules/agent-applications/pages/Notifications";
import AgentApplications from "./modules/agent-applications/pages/Messages";

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
          element: <Navigate to="/explore" replace />,
        },

        {
          path: "explore",
          Component: Explore,
        },

        {
          path: "explorar",
          element: <Navigate to="/explore" replace />,
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
              element: <RegisterStepLayout />,
              children: [
                {
                  path: "account",
                  Component: RegisterAccount,
                },

                {
                  path: "profile",
                  Component: RegisterBasicProfile,
                },

                {
                  path: "verification",
                  Component: RegisterVerification,
                },

                {
                  path: "owner",
                  element: <Navigate to="/registro/account" replace />,
                },

                {
                  path: "agent",
                  element: <Navigate to="/registro/account" replace />,
                },

                {
                  path: "client",
                  element: <Navigate to="/registro/account" replace />,
                },

                {
                  path: "personal-data",
                  Component: RegisterLegacyRedirect,
                },

                {
                  path: "security",
                  Component: RegisterLegacyRedirect,
                },

                {
                  path: "profile-photo",
                  Component: RegisterLegacyRedirect,
                },

                {
                  path: "owner-info",
                  Component: RegisterLegacyRedirect,
                },

                {
                  path: "agent-info",
                  Component: RegisterLegacyRedirect,
                },

                {
                  path: "client-info",
                  Component: RegisterLegacyRedirect,
                },
              ],
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

        {
          path: "agentes/:agentId",
          Component: AgentPublicProfile,
        },

        {
          path: "perfil/:userId",
          Component: UserPublicProfile,
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
              <ConversationsInbox />
            </ProtectedRoute>
          ),
        },

        {
          path: "mensajes/:conversationId",
          element: (
            <ProtectedRoute>
              <ConversationThread />
            </ProtectedRoute>
          ),
        },

        {
          path: "visitas",
          element: (
            <ProtectedRoute>
              <MyVisits />
            </ProtectedRoute>
          ),
        },

        {
          path: "visitas/:visitId",
          element: (
            <ProtectedRoute>
              <VisitDetails />
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
          path: "solicitudes-agentes",
          element: (
            <ProtectedRoute>
              <AgentApplications />
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
