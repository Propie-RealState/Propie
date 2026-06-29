import { Outlet } from "react-router-dom";
import { isPublicRegistrationEnabled } from "../../lib/feature-flags";
import ClosedBeta from "../../app/pages/ClosedBeta";

export function RegistrationRouteGate() {
  if (!isPublicRegistrationEnabled()) {
    return <ClosedBeta />;
  }

  return <Outlet />;
}
