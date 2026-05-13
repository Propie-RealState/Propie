import { createBrowserRouter } from "react-router-dom";
import { Root } from "./Root";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import RegisterChoice from "./pages/RegisterChoice";
import RegisterPropie from "./pages/RegisterPropie";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
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
        Component: RegisterChoice,
      },
      {
        path: "registro/propie",
        Component: RegisterPropie,
      },
      {
        path: "registro/agente",
        Component: RegisterAgente,
      },
      {
        path: "registro/verificacion",
        Component: RegisterVerification,
      },
      {
        path: "registro/datos-personales",
        Component: RegisterPersonalData,
      },
      {
        path: "registro/seguridad",
        Component: RegisterSecurity,
      },
      {
        path: "registro/foto-perfil",
        Component: RegisterProfilePhoto,
      },
      {
        path: "registro/informacion-propietario",
        Component: RegisterOwnerInfo,
      },
      {
        path: "registro/informacion-agente",
        Component: RegisterAgentInfo,
      },
      {
        path: "publicar",
        Component: PublishStep1,
      },
      {
        path: "publicar/fotos-videos",
        Component: PublishStep2,
      },
      {
        path: "publicar/informacion",
        Component: PublishStep3,
      },
      {
        path: "publicar/comercializacion",
        Component: PublishStep4,
      },
      {
        path: "publicar/verificacion",
        Component: PublishStep5,
      },
      {
        path: "propiedad/:id",
        Component: PropertyDetails,
      },
      {
        path: "compartir/:id",
        Component: Share,
      },
    ],
  },
]);
