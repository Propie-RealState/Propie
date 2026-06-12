import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./app/App";

import { AuthProvider } from "./context/AuthContext";
import { LocationPreferencesManager } from "./app/components/LocationPreferencesManager";
import { PushNotificationManager } from "./app/components/PushNotificationManager";
import { queryClient } from "./lib/query-client";
import { ToastHost } from "./app/components/ToastHost";

import "./styles/index.css";

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
