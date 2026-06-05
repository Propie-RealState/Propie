import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";
import {
  AUTH_SESSION_READY_EVENT,
  dismissGeoBannerForSession,
  markGeoPromptShown,
  requestAndPersistLocation,
  setStoredGeoStatus,
  shouldShowGeoBanner,
  syncNotificationLocationOnAuth,
  type SyncLocationResult,
} from "../lib/location-preferences";

export function useLocationPreferencesSync() {
  const { user, accessToken } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [syncNonce, setSyncNonce] = useState(0);
  const runIdRef = useRef(0);

  const applySyncResult = useCallback((result: SyncLocationResult) => {
    if (result.status === "persisted") {
      setShowPrompt(false);
      setShowBanner(false);
      return;
    }

    if (result.status === "prompt_needed") {
      setShowPrompt(true);
      setShowBanner(false);
      return;
    }

    setShowPrompt(false);
    setShowBanner(shouldShowGeoBanner(result));
  }, []);

  const runSync = useCallback(async () => {
    const runId = ++runIdRef.current;
    const result = await syncNotificationLocationOnAuth();

    if (runId !== runIdRef.current) {
      return;
    }

    applySyncResult(result);
  }, [applySyncResult]);

  useEffect(() => {
    if (!user?.id || !accessToken) {
      runIdRef.current += 1;
      setShowPrompt(false);
      setShowBanner(false);
      return;
    }

    void runSync();
  }, [accessToken, runSync, syncNonce, user?.id]);

  useEffect(() => {
    function handleSessionReady() {
      setSyncNonce((value) => value + 1);
    }

    window.addEventListener(AUTH_SESSION_READY_EVENT, handleSessionReady);
    return () => {
      window.removeEventListener(AUTH_SESSION_READY_EVENT, handleSessionReady);
    };
  }, []);

  const acceptPrompt = useCallback(async () => {
    markGeoPromptShown();
    setRequesting(true);

    try {
      const result = await requestAndPersistLocation();
      applySyncResult(result);

      if (result.status === "denied" || result.status === "error") {
        setShowBanner(true);
      }
    } finally {
      setRequesting(false);
    }
  }, [applySyncResult]);

  const skipPrompt = useCallback(() => {
    markGeoPromptShown();
    setStoredGeoStatus("skipped");
    setShowPrompt(false);
    setShowBanner(true);
  }, []);

  const dismissBanner = useCallback(() => {
    dismissGeoBannerForSession();
    setShowBanner(false);
  }, []);

  const activateFromBanner = useCallback(async () => {
    setRequesting(true);

    try {
      const result = await requestAndPersistLocation();
      applySyncResult(result);
    } finally {
      setRequesting(false);
    }
  }, [applySyncResult]);

  return {
    showPrompt,
    showBanner,
    requesting,
    acceptPrompt,
    skipPrompt,
    dismissBanner,
    activateFromBanner,
  };
}
