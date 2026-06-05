import React from "react";

import { useLocationPreferencesSync } from "@/hooks/useLocationPreferencesSync";
import { LocationPermissionBanner } from "./LocationPermissionBanner";
import { LocationPermissionPrompt } from "./LocationPermissionPrompt";

export function LocationPreferencesManager() {
  const {
    showPrompt,
    showBanner,
    requesting,
    acceptPrompt,
    skipPrompt,
    dismissBanner,
    activateFromBanner,
  } = useLocationPreferencesSync();

  return (
    <>
      <LocationPermissionPrompt
        open={showPrompt}
        loading={requesting}
        onAccept={() => {
          void acceptPrompt();
        }}
        onSkip={skipPrompt}
      />
      <LocationPermissionBanner
        open={showBanner && !showPrompt}
        loading={requesting}
        onActivate={() => {
          void activateFromBanner();
        }}
        onDismiss={dismissBanner}
      />
    </>
  );
}
