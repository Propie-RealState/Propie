import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./app/App";

import { AuthProvider } from "./context/AuthContext";
import { LocationPreferencesManager } from "./app/components/LocationPreferencesManager";
import { PushNotificationManager } from "./app/components/PushNotificationManager";
import { queryClient } from "./lib/query-client";
import { ToastHost } from "./app/components/ToastHost";
import { initAnalytics } from "./lib/analytics";

import "./styles/index.css";

if (import.meta.env.MODE !== "production") {
  (
    window as Window & { __PROPIE_QUERY_CLIENT__?: typeof queryClient }
  ).__PROPIE_QUERY_CLIENT__ = queryClient;
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <LocationPreferencesManager />
        <PushNotificationManager />
        <ToastHost />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);

// Analytics is initialised after the app is interactive so posthog-js never
// blocks first render or competes for the main thread during startup.
const startAnalytics = () => initAnalytics();
if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(startAnalytics, { timeout: 3000 });
  } else {
    window.setTimeout(startAnalytics, 2000);
  }
}
