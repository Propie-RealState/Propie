import { useCallback, useMemo } from "react";
import type { RegisterData } from "../../../context/RegisterContext";
import {
  useFormValidation,
  validateSecurityStep,
  validationMessages,
} from "../validation";

export function useSecurityValidation(data: RegisterData) {
  const context = useMemo(
    () => ({ pinEnabled: data.pinEnabled }),
    [data.pinEnabled],
  );

  const getValues = useCallback(
    () => ({
      recoveryEmail: data.recoveryEmail,
      recoveryPhone: data.recoveryPhone,
      pin: data.pin,
    }),
    [data],
  );

  const validateAll = useCallback(
    () => validateSecurityStep(data, context),
    [data, context],
  );

  const validation = useFormValidation(getValues, validateAll);

  return {
    validation,
    showSuccess: validation.isValid,
    successMessage: validationMessages.security.valid,
  };
}
