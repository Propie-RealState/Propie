import React from "react";

import { PageTransition } from "./components/PageTransition";
import AppStartup from "./pages/SplashScreen";

export function Root() {
  return (
    <AppStartup>
      <PageTransition />
    </AppStartup>
  );
}
