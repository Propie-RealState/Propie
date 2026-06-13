import { useCallback } from "react";
import type { RegisterData } from "../../../context/RegisterContext";
import {
  useFormValidation,
  validatePersonalDataStep,
  type PersonalDataContext,
} from "../validation";

export function usePersonalDataValidation(
  data: RegisterData,
  context: PersonalDataContext,
) {
  const getValues = useCallback(
    () => ({
      dni: data.dni,
      birthDate: data.birthDate,
      nationality: data.nationality,
      cuitCuil: data.cuitCuil,
      address: data.address,
      location: data.location || data.address,
      dniFrontImage: context.dniFrontImage,
      dniBackImage: context.dniBackImage,
      biometricSelfie: context.biometricSelfie,
    }),
    [data, context],
  );

  const validateAll = useCallback(
    () => validatePersonalDataStep(data, context),
    [data, context],
  );

  return useFormValidation(getValues, validateAll);
}
