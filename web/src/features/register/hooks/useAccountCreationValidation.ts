import { useCallback, useMemo } from "react";
import type { RegisterData } from "../../../context/RegisterContext";
import {
  getPasswordStrength,
  normalizeEmail,
  useFormValidation,
  validateAccountStep,
} from "../validation";

export function useAccountCreationValidation(data: RegisterData) {
  const getValues = useCallback(
    () => ({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      acceptTerms: data.acceptTerms,
      acceptPrivacy: data.acceptPrivacy,
    }),
    [data],
  );

  const validateAll = useCallback(() => validateAccountStep(data), [data]);

  const validation = useFormValidation(getValues, validateAll);
  const passwordStrength = useMemo(
    () => getPasswordStrength(data.password),
    [data.password],
  );

  return { validation, passwordStrength, normalizeEmail };
}
