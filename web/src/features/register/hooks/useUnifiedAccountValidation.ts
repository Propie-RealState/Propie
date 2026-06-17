import { useCallback, useMemo } from "react";
import type { RegisterData } from "../../../context/RegisterContext";
import {
  getPasswordStrength,
  normalizeEmail,
  useFormValidation,
  validateUnifiedAccountStep,
} from "../validation";

export function useUnifiedAccountValidation(data: RegisterData) {
  const getValues = useCallback(
    () => ({
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    }),
    [data.confirmPassword, data.email, data.password],
  );

  const validateAll = useCallback(
    () => validateUnifiedAccountStep(data),
    [data],
  );

  const validation = useFormValidation(getValues, validateAll);
  const passwordStrength = useMemo(
    () => getPasswordStrength(data.password),
    [data.password],
  );

  return { validation, passwordStrength, normalizeEmail };
}
