import { useCallback } from "react";
import type { RegisterData } from "../../../context/RegisterContext";
import {
  useFormValidation,
  validateSecurityStep,
  validationMessages,
} from "../validation";

export function useSecurityValidation(data: RegisterData) {
  const getValues = useCallback(
    () => ({
      phone: data.phone,
    }),
    [data],
  );

  const validateAll = useCallback(() => validateSecurityStep(data), [data]);

  const validation = useFormValidation(getValues, validateAll);

  return {
    validation,
    showSuccess: validation.isValid,
    successMessage: validationMessages.security.valid,
  };
}
