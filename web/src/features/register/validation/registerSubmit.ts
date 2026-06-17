import type { NavigateFunction } from "react-router-dom";
import type { RegisterData, RegisterRole } from "../../../context/RegisterContext";
import {
  type FieldErrors,
  fieldValidators,
  type PersonalDataContext,
  type ProfilePhotoContext,
  type SecurityContext,
  type StepValidation,
  validateMinimalAccountStep,
} from "./schemas";
import { validateVerificationCode } from "./validators";

export type RegisterRedirectState = {
  registerFieldErrors?: FieldErrors;
  fromFinalSubmit?: boolean;
};

export type RegistrationCheckContext = {
  personal: PersonalDataContext;
  security: SecurityContext;
  profilePhoto: ProfilePhotoContext;
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
    fields: ["verificationCode"],
    route: () => "/registro/verification",
  },
  {
    fields: ["dni", "birthDate", "nationality", "cuitCuil", "address", "location"],
    route: () => "/registro/personal-data",
  },
  {
    fields: ["recoveryEmail", "recoveryPhone", "pin"],
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
    collectStepFailure(getRegisterAccountRoute(data.role), validateMinimalAccountStep(data)),
    collectStepFailure("/registro/verification", (() => {
      const result = validateVerificationCode(data.verificationCode);
      return {
        valid: result.valid,
        errors: result.valid ? {} : { verificationCode: result.error },
      };
    })()),
  ];

  for (const failure of checks) {
    if (failure) return failure;
  }

  return { valid: true };
}

function resolveFieldError(field: string, data: RegisterData): string | undefined {
  const mapped = API_FIELD_ALIASES[field] ?? field;
  const validator = fieldValidators[mapped];
  if (!validator) return "Revisá este campo antes de continuar.";

  const value =
    mapped === "location"
      ? data.location || data.address
      : (data as Record<string, unknown>)[mapped];

  const result = validator(value);
  return result.valid ? undefined : result.error;
}

function routeForField(field: string, role: RegisterRole | null): string | null {
  const mapped = API_FIELD_ALIASES[field] ?? field;
  for (const step of FIELD_STEP_ROUTES) {
    if (step.fields.includes(mapped)) {
      return step.route(role);
    }
  }
  return null;
}

export function mapApiFieldErrors(
  apiFieldErrors: Record<string, string[] | undefined>,
  data: RegisterData,
): { route: string; errors: FieldErrors } | null {
  const fields = Object.keys(apiFieldErrors);
  if (fields.length === 0) return null;

  for (const step of FIELD_STEP_ROUTES) {
    const matching = fields
      .map((field) => API_FIELD_ALIASES[field] ?? field)
      .filter((field) => step.fields.includes(field));

    if (matching.length === 0) continue;

    const errors: FieldErrors = {};
    for (const field of matching) {
      const message = resolveFieldError(field, data);
      if (message) errors[field] = message;
    }

    if (Object.keys(errors).length > 0) {
      return { route: step.route(data.role), errors };
    }
  }

  const firstField = fields[0];
  const route = routeForField(firstField, data.role);
  if (!route) return null;

  const errors: FieldErrors = {};
  const mapped = API_FIELD_ALIASES[firstField] ?? firstField;
  const message = resolveFieldError(mapped, data);
  if (message) errors[mapped] = message;

  return { route, errors };
}

export function handleRegisterValidationFailure(
  error: unknown,
  data: RegisterData,
  navigate: NavigateFunction,
): boolean {
  if (
    typeof error !== "object" ||
    error === null ||
    (error as { error?: string }).error !== "VALIDATION_ERROR"
  ) {
    return false;
  }

  const fieldErrors = (error as {
    details?: { fieldErrors?: Record<string, string[] | undefined> };
  }).details?.fieldErrors;

  if (!fieldErrors) return false;

  const mapped = mapApiFieldErrors(fieldErrors, data);
  if (!mapped) return false;

  navigate(mapped.route, {
    state: {
      registerFieldErrors: mapped.errors,
      fromFinalSubmit: true,
    } satisfies RegisterRedirectState,
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
