import type { NavigateFunction } from "react-router-dom";
import type { RegisterData, RegisterRole } from "../../../context/RegisterContext";
import { validationMessages } from "./messages";
import { publishRegisterRedirect } from "./registerRedirectStore";
import {
  type FieldErrors,
  fieldValidators,
  type PersonalDataContext,
  type ProfilePhotoContext,
  type SecurityContext,
  type StepValidation,
  validateAccountStep,
  validatePersonalDataPersistedStep,
  validateProfilePhotoStep,
  validateSecurityStep,
} from "./schemas";

export type RegisterRedirectState = {
  registerFieldErrors?: FieldErrors;
  registerFormError?: string;
  fromFinalSubmit?: boolean;
};

export type RegistrationCheckContext = {
  personal: PersonalDataContext;
  security: SecurityContext;
  profilePhoto: ProfilePhotoContext;
};

type ApiErrorBody = {
  error?: string;
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
};

const API_FIELD_ALIASES: Record<string, string> = {
  phone: "recoveryPhone",
};

const FIELD_STEP_ROUTES: Array<{
  fields: string[];
  route: (role: RegisterRole | null) => string;
}> = [
  {
    fields: ["firstName", "lastName", "email", "password", "acceptTerms", "acceptPrivacy"],
    route: (role) => getRegisterAccountRoute(role),
  },
  {
    fields: ["dni", "birthDate", "nationality", "cuitCuil", "address", "location"],
    route: () => "/registro/personal-data",
  },
  {
    fields: ["recoveryEmail", "recoveryPhone", "pin", "phone"],
    route: () => "/registro/security",
  },
  {
    fields: ["profilePhoto"],
    route: () => "/registro/profile-photo",
  },
  {
    fields: ["bio"],
    route: (role) => getRegisterProfileRoute(role),
  },
];

/** Business errors that map to a specific wizard field. */
const BUSINESS_FIELD_ERRORS: Record<
  string,
  {
    field: string;
    message: string;
    route: (role: RegisterRole | null) => string;
  }
> = {
  EMAIL_ALREADY_EXISTS: {
    field: "email",
    message: validationMessages.email.alreadyExists,
    route: (role) => getRegisterAccountRoute(role),
  },
};

/** Business errors that are step-level (no single field). */
const BUSINESS_FORM_ERRORS: Record<string, string> = {
  REGISTRATION_DISABLED: validationMessages.submit.registrationDisabled,
};

export function getRegisterAccountRoute(role: RegisterRole | null): string {
  if (role === "AGENT") return "/registro/agent";
  if (role === "CLIENT") return "/registro/client";
  return "/registro/owner";
}

export function getRegisterProfileRoute(role: RegisterRole | null): string {
  if (role === "AGENT") return "/registro/agent-info";
  if (role === "CLIENT") return "/registro/client-info";
  return "/registro/owner-info";
}

function collectStepFailure(
  route: string,
  result: StepValidation,
): { valid: false; route: string; errors: FieldErrors } | null {
  if (result.valid) return null;
  return { valid: false, route, errors: result.errors };
}

export function ensureRegistrationReady(
  data: RegisterData,
  context: RegistrationCheckContext,
):
  | { valid: true }
  | { valid: false; route: string; errors: FieldErrors } {
  const checks = [
    collectStepFailure(getRegisterAccountRoute(data.role), validateAccountStep(data)),
    collectStepFailure(
      "/registro/personal-data",
      validatePersonalDataPersistedStep(data),
    ),
    collectStepFailure(
      "/registro/security",
      validateSecurityStep(data, context.security),
    ),
    collectStepFailure(
      "/registro/profile-photo",
      validateProfilePhotoStep(context.profilePhoto),
    ),
  ];

  for (const failure of checks) {
    if (failure) return failure;
  }

  return { valid: true };
}

function resolveFieldError(field: string, data: RegisterData): string | undefined {
  const mapped = API_FIELD_ALIASES[field] ?? field;
  const validator = fieldValidators[mapped];
  if (!validator) return undefined;

  const value =
    mapped === "location"
      ? data.location || data.address
      : (data as Record<string, unknown>)[mapped];

  const result = validator(value);
  return result.valid ? undefined : result.error;
}

function firstApiMessage(
  messages: string[] | undefined,
): string | undefined {
  return messages?.find((message) => Boolean(message?.trim()));
}

function routeForField(field: string, role: RegisterRole | null): string | null {
  const mapped = API_FIELD_ALIASES[field] ?? field;
  for (const step of FIELD_STEP_ROUTES) {
    if (step.fields.includes(mapped) || step.fields.includes(field)) {
      return step.route(role);
    }
  }
  return null;
}

function toUiField(apiField: string): string {
  return API_FIELD_ALIASES[apiField] ?? apiField;
}

/**
 * Maps API fieldErrors to the first matching wizard step.
 * Prefers backend messages; falls back to FE validators, then a generic hint.
 */
export function mapApiFieldErrors(
  apiFieldErrors: Record<string, string[] | undefined>,
  data: RegisterData,
): { route: string; errors: FieldErrors } | null {
  const fields = Object.keys(apiFieldErrors);
  if (fields.length === 0) return null;

  for (const step of FIELD_STEP_ROUTES) {
    const matchingApiFields = fields.filter((apiField) => {
      const uiField = toUiField(apiField);
      return step.fields.includes(uiField) || step.fields.includes(apiField);
    });

    if (matchingApiFields.length === 0) continue;

    const errors: FieldErrors = {};
    for (const apiField of matchingApiFields) {
      const uiField = toUiField(apiField);
      const backendMessage = firstApiMessage(apiFieldErrors[apiField]);
      const frontendMessage = resolveFieldError(uiField, data);
      errors[uiField] =
        backendMessage ||
        frontendMessage ||
        "Revisá este campo antes de continuar.";
    }

    return { route: step.route(data.role), errors };
  }

  const firstField = fields[0];
  const route = routeForField(firstField, data.role);
  if (!route) return null;

  const uiField = toUiField(firstField);
  const backendMessage = firstApiMessage(apiFieldErrors[firstField]);
  const frontendMessage = resolveFieldError(uiField, data);

  return {
    route,
    errors: {
      [uiField]:
        backendMessage ||
        frontendMessage ||
        "Revisá este campo antes de continuar.",
    },
  };
}

function isApiErrorBody(error: unknown): error is ApiErrorBody {
  return typeof error === "object" && error !== null;
}

/** Navigate to a registration step while preserving errors across Strict Mode remounts. */
export function navigateWithRegisterErrors(
  navigate: NavigateFunction,
  route: string,
  state: RegisterRedirectState,
) {
  const redirectState: RegisterRedirectState = {
    ...state,
    fromFinalSubmit: true,
  };
  publishRegisterRedirect(redirectState);
  navigate(route, {
    state: redirectState,
  });
}

/** User-facing message for API failures that stay on the final step. */
export function getRegisterSubmitErrorMessage(error: unknown): string {
  if (isApiErrorBody(error) && typeof error.error === "string") {
    if (error.error in BUSINESS_FORM_ERRORS) {
      return BUSINESS_FORM_ERRORS[error.error];
    }
    if (error.error in BUSINESS_FIELD_ERRORS) {
      return BUSINESS_FIELD_ERRORS[error.error].message;
    }
    if (error.error === "VALIDATION_ERROR") {
      const formError = firstApiMessage(error.details?.formErrors);
      if (formError) return formError;
    }
  }

  if (error instanceof Error && error.message === "INVALID_REGISTER_RESPONSE") {
    return validationMessages.submit.generic;
  }

  return validationMessages.submit.generic;
}

/**
 * Handles register API failures by navigating to the correct step with
 * field/form errors. Returns true when the error was surfaced via navigation.
 */
export function handleRegisterValidationFailure(
  error: unknown,
  data: RegisterData,
  navigate: NavigateFunction,
): boolean {
  if (!isApiErrorBody(error) || typeof error.error !== "string") {
    return false;
  }

  const code = error.error;

  const businessField = BUSINESS_FIELD_ERRORS[code];
  if (businessField) {
    navigateWithRegisterErrors(navigate, businessField.route(data.role), {
      registerFieldErrors: {
        [businessField.field]: businessField.message,
      },
    });
    return true;
  }

  const businessForm = BUSINESS_FORM_ERRORS[code];
  if (businessForm) {
    navigateWithRegisterErrors(navigate, getRegisterAccountRoute(data.role), {
      registerFormError: businessForm,
    });
    return true;
  }

  if (code !== "VALIDATION_ERROR") {
    return false;
  }

  const fieldErrors = error.details?.fieldErrors;
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    const mapped = mapApiFieldErrors(fieldErrors, data);
    if (mapped) {
      navigateWithRegisterErrors(navigate, mapped.route, {
        registerFieldErrors: mapped.errors,
      });
      return true;
    }
  }

  const formError = firstApiMessage(error.details?.formErrors);
  if (formError) {
    navigateWithRegisterErrors(navigate, getRegisterAccountRoute(data.role), {
      registerFormError: formError,
    });
    return true;
  }

  navigateWithRegisterErrors(navigate, getRegisterAccountRoute(data.role), {
    registerFormError: validationMessages.submit.generic,
  });
  return true;
}

export function buildRegistrationContext(
  data: RegisterData,
  options?: {
    dniFrontImage?: File | null;
    dniBackImage?: File | null;
    biometricSelfie?: File | null;
    profilePhoto?: File | null;
  },
): RegistrationCheckContext {
  return {
    personal: {
      isAgent: data.role === "AGENT",
      dniFrontImage: options?.dniFrontImage ?? null,
      dniBackImage: options?.dniBackImage ?? null,
      biometricSelfie: options?.biometricSelfie ?? null,
    },
    security: { pinEnabled: data.pinEnabled },
    profilePhoto: { file: options?.profilePhoto ?? null },
  };
}
