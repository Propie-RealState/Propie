import { useCallback, useMemo, useState } from "react";
import type { FieldErrors } from "./schemas";
import { fieldValidators } from "./schemas";
import type { ValidationResult } from "./validators";

export type TouchedFields = Record<string, boolean>;

export type UseFormValidationOptions = {
  validateOnChange?: boolean;
};

export function useFormValidation(
  getValues: () => Record<string, unknown>,
  validateAll: () => { valid: boolean; errors: FieldErrors },
  options: UseFormValidationOptions = { validateOnChange: true },
) {
  const [touched, setTouched] = useState<TouchedFields>({});
  const [submitted, setSubmitted] = useState(false);
  const [liveErrors, setLiveErrors] = useState<FieldErrors>({});

  const validateField = useCallback(
    (field: string, value?: unknown): ValidationResult => {
      const validator = fieldValidators[field];
      if (!validator) return { valid: true };
      const resolved =
        value !== undefined ? value : getValues()[field];
      return validator(resolved);
    },
    [getValues],
  );

  const touchField = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const runValidation = useCallback(() => {
    const result = validateAll();
    setLiveErrors(result.errors);
    return result;
  }, [validateAll]);

  const handleBlur = useCallback(
    (field: string) => {
      touchField(field);
      const result = validateField(field);
      setLiveErrors((prev) => ({
        ...prev,
        [field]: result.valid ? undefined : result.error,
      }));
    },
    [touchField, validateField],
  );

  const handleChange = useCallback(
    (field: string, value?: unknown) => {
      if (!options.validateOnChange) return;
      const result = validateField(field, value);
      setLiveErrors((prev) => ({
        ...prev,
        [field]: result.valid ? undefined : result.error,
      }));
    },
    [options.validateOnChange, validateField],
  );

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    const allTouched: TouchedFields = {};
    const values = getValues();
    for (const key of Object.keys(values)) {
      allTouched[key] = true;
    }
    setTouched(allTouched);
    return runValidation();
  }, [getValues, runValidation]);

  const seedFieldErrors = useCallback((errors: FieldErrors) => {
    setSubmitted(true);
    setLiveErrors(errors);
    setTouched((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(errors)) {
        next[key] = true;
      }
      return next;
    });
  }, []);

  const stepValidation = useMemo(() => validateAll(), [validateAll]);

  const visibleErrors = useMemo(() => {
    const merged: FieldErrors = { ...liveErrors };
    for (const [field, error] of Object.entries(stepValidation.errors)) {
      if (error && (touched[field] || submitted)) {
        merged[field] = error;
      }
    }
    return merged;
  }, [liveErrors, stepValidation.errors, touched, submitted]);

  const showError = useCallback(
    (field: string) => Boolean(visibleErrors[field]),
    [visibleErrors],
  );

  const getError = useCallback(
    (field: string) => visibleErrors[field],
    [visibleErrors],
  );

  const errorList = useMemo(
    () =>
      Object.entries(visibleErrors)
        .filter(([, msg]) => Boolean(msg))
        .map(([, msg]) => msg as string),
    [visibleErrors],
  );

  return {
    touched,
    submitted,
    isValid: stepValidation.valid,
    errors: visibleErrors,
    errorList,
    showError,
    getError,
    touchField,
    handleBlur,
    handleChange,
    handleSubmit,
    seedFieldErrors,
    runValidation,
    validateField,
  };
}
