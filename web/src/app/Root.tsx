import React from "react";

import { PageTransition } from "./components/PageTransition";
import AppStartup from "./pages/SplashScreen";
import { InstallBanner } from "./components/InstallBanner";

export function Root() {
  return (
    <AppStartup>
      <PageTransition />
      <InstallBanner />
    </AppStartup>
  );
}
