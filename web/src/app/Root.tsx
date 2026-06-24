import React from "react";

import { useAppViewportHeight } from "../hooks/useAppViewportHeight";
import { PageTransition } from "./components/PageTransition";
import AppStartup from "./pages/SplashScreen";
import { InstallBanner } from "./components/InstallBanner";

export function Root() {
  useAppViewportHeight();

  return (
    <AppStartup>
      <PageTransition />
      <InstallBanner />
    </AppStartup>
  );
}
