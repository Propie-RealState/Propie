import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { Root } from "./Root";
import { RegisterProvider } from "../context/RegisterContext";
import { RegisterStepLayout } from "./components/register/RegisterStepLayout";
import { RegistrationRouteGate } from "../components/auth/RegistrationRouteGate";

// Explore stays eager: it is the default landing route and the critical path.
import Explore from "./modules/explore/pages/Explore.tsx";

import { PublisherRoute } from "../components/auth/PublisherRoute";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminRoute } from "../components/auth/AdminRoute";
// Lightweight (types + localStorage only) and wraps every route, so it stays
// eager — lazy-loading it here would delay the critical Explore route.
import { PropertyPublishProvider } from "./modules/publish/context/PropertyPublishContext";

// ==================================================
// Lazy-loaded routes — split out of the initial bundle.
// Each becomes its own chunk fetched on navigation.
// ==================================================
const Login = lazy(() => import("./pages/Login"));

const RegisterChoice = lazy(() => import("./pages/RegisterChoice"));
const RegisterPropie = lazy(() => import("./pages/RegisterDueño"));
const RegisterAgente = lazy(() => import("./pages/RegisterAgente"));
const RegisterVerification = lazy(() => import("./pages/RegisterVerification"));
const RegisterPersonalData = lazy(() => import("./pages/RegisterPersonalData"));
const RegisterSecurity = lazy(() => import("./pages/RegisterSecurity"));
const RegisterProfilePhoto = lazy(() => import("./pages/RegisterProfilePhoto"));
const RegisterOwnerInfo = lazy(() => import("./pages/RegisterOwnerInfo"));
const RegisterAgentInfo = lazy(() => import("./pages/RegisterAgentInfo"));
const RegisterClient = lazy(() => import("./pages/RegisterClient"));
const RegisterClientInfo = lazy(() => import("./pages/RegisterClientInfo"));

const Favorites = lazy(() => import("./modules/favorites/pages/Favorites"));

const PublishStep1 = lazy(() => import("./modules/publish/pages/PublishStep1"));
const PublishStep2 = lazy(() => import("./modules/publish/pages/PublishStep2"));
const PublishStep3 = lazy(() => import("./modules/publish/pages/PublishStep3"));
const PublishStep4 = lazy(() => import("./modules/publish/pages/PublishStep4"));
const PublishStep5 = lazy(() => import("./modules/publish/pages/PublishStep5"));

const PropertyDetails = lazy(() => import("./modules/explore/pages/PropertyDetails"));
const EditProperty = lazy(() => import("./modules/explore/pages/EditProperty"));

const Share = lazy(() => import("./pages/Share"));
const Profile = lazy(() => import("./modules/profile/pages/Profile.tsx"));
const Settings = lazy(() => import("./modules/profile/pages/Settings.tsx"));
const AgentPublicProfile = lazy(() => import("./modules/agents/pages/AgentPublicProfile.tsx"));
const UserPublicProfile = lazy(() => import("./modules/agents/pages/UserPublicProfile.tsx"));
const MyProperties = lazy(() => import("./modules/my-properties/pages/MyProperties"));
const ConversationsInbox = lazy(() => import("./modules/property-conversations/pages/ConversationsInbox"));
const ConversationThread = lazy(() => import("./modules/property-conversations/pages/ConversationThread"));
const MyVisits = lazy(() => import("./modules/visits/pages/MyVisits"));
const VisitDetails = lazy(() => import("./modules/visits/pages/VisitDetails"));
const Notifications = lazy(() => import("./modules/agent-applications/pages/Notifications"));
const AgentApplications = lazy(() => import("./modules/agent-applications/pages/Messages"));
const AdminDashboard = lazy(() => import("./modules/admin/pages/AdminDashboard"));

const PropertyMap = lazy(() => import("./modules/map/pages/PropertyMap"));

function MapRoute() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100dvh",
            display: "grid",
            placeItems: "center",
            background: "#f5f5f7",
            color: "#141414",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
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

export const router = createBrowserRouter([
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
        element: <Navigate to="/explorar" replace />,
      },

      {
        path: "explore",
        element: <Navigate to="/explorar" replace />,
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
            <RegistrationRouteGate />
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
        path: "configuracion",
        element: (
          <ProtectedRoute>
            <Settings />
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
        path: "admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
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
      },
    ],
  },
]);
