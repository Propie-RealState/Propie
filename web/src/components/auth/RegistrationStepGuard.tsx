import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useRegister } from "../../context/RegisterContext";
import { resolveRegistrationRedirect } from "../../features/register/registrationProgress";

/**
 * Enforces registration wizard step order from persisted navigation progress.
 * Does not read secrets or run Finalizar validation.
 */
export function RegistrationStepGuard() {
  const { data } = useRegister();
  const location = useLocation();
  const redirectTo = resolveRegistrationRedirect(location.pathname, data);

  if (redirectTo && redirectTo !== location.pathname) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
