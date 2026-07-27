import { isPublicRegistrationEnabled } from "../../lib/feature-flags";
import ClosedBeta from "../../app/pages/ClosedBeta";
import { RegistrationStepGuard } from "./RegistrationStepGuard";

export function RegistrationRouteGate() {
  if (!isPublicRegistrationEnabled()) {
    return <ClosedBeta />;
  }

  return <RegistrationStepGuard />;
}
