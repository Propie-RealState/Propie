import { useCallback, useEffect, useState } from "react";

import {
  getPushVapidPublicKey,
  registerPushSubscription,
} from "../app/modules/notifications/services/notifications.service";
import { useAuth } from "../context/AuthContext";
import {
  getExistingPushSubscription,
  hasPushPromptShown,
  isPushSupported,
  markPushPromptShown,
  PUSH_ENGAGEMENT_EVENT,
  PUSH_SUBSCRIPTION_CHANGED_EVENT,
  setStoredPushStatus,
  subscribeToPushNotifications,
  subscriptionToPayload,
} from "../lib/push-notifications";

export function usePushNotifications() {
  const { user, accessToken } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [engaged, setEngaged] = useState(false);

  const syncExistingSubscription = useCallback(async () => {
    if (!user || !accessToken || !isPushSupported()) {
      return;
    }

    try {
      const config = await getPushVapidPublicKey();

      if (!config.enabled || !config.publicKey) {
        return;
      }

      const existing = await getExistingPushSubscription();

      if (!existing) {
        return;
      }

      await registerPushSubscription(subscriptionToPayload(existing));
      setStoredPushStatus("granted");
      window.dispatchEvent(new Event(PUSH_SUBSCRIPTION_CHANGED_EVENT));
    } catch {
      // Ignore background sync failures.
    }
  }, [accessToken, user]);

  useEffect(() => {
    if (!user?.id || !accessToken) {
      setShowPrompt(false);
      setEngaged(false);
      return;
    }

    void syncExistingSubscription();
  }, [accessToken, syncExistingSubscription, user?.id]);

  useEffect(() => {
    function handleEngagement() {
      setEngaged(true);
    }

    window.addEventListener(PUSH_ENGAGEMENT_EVENT, handleEngagement);
    return () => {
      window.removeEventListener(PUSH_ENGAGEMENT_EVENT, handleEngagement);
    };
  }, []);

  useEffect(() => {
    if (!user?.id || !accessToken || !engaged || !isPushSupported()) {
      return;
    }

    if (hasPushPromptShown()) {
      return;
    }

    if (Notification.permission === "granted") {
      markPushPromptShown();
      void syncExistingSubscription();
      return;
    }

    if (Notification.permission === "denied") {
      markPushPromptShown();
      setStoredPushStatus("denied");
      return;
    }

    setShowPrompt(true);
  }, [
    accessToken,
    engaged,
    syncExistingSubscription,
    user?.id,
  ]);

  const acceptPrompt = useCallback(async () => {
    markPushPromptShown();
    setRequesting(true);

    try {
      const config = await getPushVapidPublicKey();

      if (!config.enabled || !config.publicKey) {
        setShowPrompt(false);
        return;
      }

      const subscription = await subscribeToPushNotifications(
        config.publicKey,
      );
      await registerPushSubscription(subscription);
      setStoredPushStatus("granted");
      setShowPrompt(false);
      window.dispatchEvent(new Event(PUSH_SUBSCRIPTION_CHANGED_EVENT));
    } catch {
      if (Notification.permission === "denied") {
        setStoredPushStatus("denied");
      }

      setShowPrompt(false);
    } finally {
      setRequesting(false);
    }
  }, []);

  const skipPrompt = useCallback(() => {
    markPushPromptShown();
    setStoredPushStatus("skipped");
    setShowPrompt(false);
  }, []);

  return {
    showPrompt,
    requesting,
    acceptPrompt,
    skipPrompt,
  };
}
