import { useCallback } from "react";
import type { RegisterData } from "../../../context/RegisterContext";
import { useFormValidation, validateBasicProfileStep } from "../validation";

export function useBasicProfileValidation(data: RegisterData) {
  const getValues = useCallback(
    () => ({
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate,
      nationality: data.nationality,
      bio: data.bio,
      acceptTerms: data.acceptTerms,
      acceptPrivacy: data.acceptPrivacy,
    }),
    [data],
  );

  const validateAll = useCallback(
    () => validateBasicProfileStep(data),
    [data],
  );

  return useFormValidation(getValues, validateAll);
}
