import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { FieldErrors } from "./schemas";
import type { RegisterRedirectState } from "./registerSubmit";
import {
  clearRegisterRedirect,
  getRegisterRedirectGeneration,
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
  const seedRef = useRef(seedFieldErrors);
  seedRef.current = seedFieldErrors;
  /** Last generation applied in this mount (avoids re-seed on replace navigate). */
  const consumedGenerationRef = useRef(0);

  useEffect(() => {
    const routerState = location.state as RegisterRedirectState | null;

    if (hasRegisterRedirectContent(routerState)) {
      publishRegisterRedirect(routerState!);
      navigate(location.pathname, { replace: true, state: null });
    }

    const pending = readRegisterRedirect();
    if (!hasRegisterRedirectContent(pending)) {
      return;
    }

    const generation = getRegisterRedirectGeneration();
    if (consumedGenerationRef.current === generation) {
      clearRegisterRedirect();
      return;
    }
    consumedGenerationRef.current = generation;

    if (pending!.registerFieldErrors) {
      seedRef.current(pending!.registerFieldErrors);
    }
    if (pending!.registerFormError) {
      setFormError(pending!.registerFormError);
    }
    setShowFinalSubmitNotice(Boolean(pending!.fromFinalSubmit));

    // Delay clear so Strict Mode remount (same mount cycle) can still read pending.
    const timer = window.setTimeout(() => {
      clearRegisterRedirect();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.key, location.pathname, location.state, navigate]);

  return { formError, showFinalSubmitNotice };
}
