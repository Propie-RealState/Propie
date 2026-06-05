import React from "react";

import { PushNotificationPrompt } from "./PushNotificationPrompt";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export function PushNotificationManager() {
  const { showPrompt, requesting, acceptPrompt, skipPrompt } =
    usePushNotifications();

  return (
    <PushNotificationPrompt
      open={showPrompt}
      loading={requesting}
      onAccept={() => {
        void acceptPrompt();
      }}
      onSkip={skipPrompt}
    />
  );
}
