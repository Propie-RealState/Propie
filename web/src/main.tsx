import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app/App";

import { AuthProvider } from "./context/AuthContext";
import { LocationPreferencesManager } from "./app/components/LocationPreferencesManager";
import { PushNotificationManager } from "./app/components/PushNotificationManager";

import "./styles/index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>

    <AuthProvider>
      <App />
      <LocationPreferencesManager />
      <PushNotificationManager />
    </AuthProvider>

  </React.StrictMode>,
);
