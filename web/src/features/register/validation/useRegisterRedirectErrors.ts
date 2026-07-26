import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { FieldErrors } from "./schemas";
import type { RegisterRedirectState } from "./registerSubmit";
import {
  clearRegisterRedirect,
  hasRegisterRedirectContent,
  publishRegisterRedirect,
  readRegisterRedirect,
} from "./registerRedirectStore";

type SeedFieldErrors = (errors: FieldErrors) => void;

/**
 * Consumes router state produced by final-submit / API error redirects
 * and seeds the current step's field errors (and optional form error).
 *
 * Uses a module-level pending store so React Strict Mode remounts still
 * receive errors after router state is cleared.
 */
export function useRegisterRedirectErrors(seedFieldErrors: SeedFieldErrors) {
  const location = useLocation();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | undefined>();
  const [showFinalSubmitNotice, setShowFinalSubmitNotice] = useState(false);

  useEffect(() => {
    const routerState = location.state as RegisterRedirectState | null;

    if (hasRegisterRedirectContent(routerState)) {
      publishRegisterRedirect(routerState!);
      navigate(location.pathname, { replace: true, state: null });
    }

    const pending = readRegisterRedirect();
    if (!hasRegisterRedirectContent(pending)) return;

    if (
      pending!.registerFieldErrors &&
      Object.keys(pending!.registerFieldErrors).length > 0
    ) {
      seedFieldErrors(pending!.registerFieldErrors);
      const firstField = Object.keys(pending!.registerFieldErrors).find((key) =>
        Boolean(pending!.registerFieldErrors?.[key]),
      );
      if (firstField) {
        requestAnimationFrame(() => {
          document.getElementById(firstField)?.focus();
        });
      }
    }

    if (pending!.registerFormError) {
      setFormError(pending!.registerFormError);
    }

    setShowFinalSubmitNotice(Boolean(pending!.fromFinalSubmit));

    // Delay clear so Strict Mode remount can re-seed from the pending store.
    const timer = window.setTimeout(() => {
      clearRegisterRedirect();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    location.key,
    location.pathname,
    location.state,
    navigate,
    seedFieldErrors,
  ]);

  return { formError, showFinalSubmitNotice };
}
