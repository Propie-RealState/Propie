import type { RegisterData } from "../../../context/RegisterContext";
import {
  validateAcceptPrivacy,
  validateAcceptTerms,
  validateBirthDate,
  validateBio,
  validateCuitCuil,
  validateAddress,
  validateLocation,
  validateDni,
  validateEmail,
  validateFirstName,
  validateImageFile,
  validateLastName,
  validateNationality,
  validatePartialGroup,
  validatePassword,
  validatePin,
  validateProfilePhotoFile,
  validateRecoveryEmail,
  validateRecoveryPhone,
  validateVerificationCodeFormat,
  validateYear,
  validateExperienceYears,
  type ValidationResult,
} from "./validators";

export type RegisterStep =
  | "account"
  | "verification"
  | "personalData"
  | "security"
  | "profilePhoto"
  | "ownerProfile"
  | "clientProfile"
  | "agentProfile";

export type FieldErrors = Record<string, string | undefined>;

export type StepValidation = {
  valid: boolean;
  errors: FieldErrors;
};

type ValidatorFn = (value: unknown, context?: unknown) => ValidationResult;

export type PersonalDataContext = {
  isAgent: boolean;
  dniFrontImage: File | null;
  dniBackImage: File | null;
  biometricSelfie: File | null;
};

export type SecurityContext = {
  pinEnabled: boolean;
};

export type AgentProfileContext = {
  education: { institution: string; degree: string; year: string };
  certification: { name: string; issuer: string; year: string };
  experience: { position: string; company: string; years: string };
};

export type ProfilePhotoContext = {
  file: File | null;
};

function collectErrors(
  entries: Array<[string, ValidationResult]>,
): StepValidation {
  const errors: FieldErrors = {};
  let valid = true;

  for (const [field, result] of entries) {
    if (!result.valid) {
      valid = false;
      errors[field] = result.error;
    }
  }

  return { valid, errors };
}

export function validateAccountStep(data: RegisterData): StepValidation {
  return collectErrors([
    ["firstName", validateFirstName(data.firstName)],
    ["lastName", validateLastName(data.lastName)],
    ["email", validateEmail(data.email)],
    ["password", validatePassword(data.password)],
    ["acceptTerms", validateAcceptTerms(data.acceptTerms)],
    ["acceptPrivacy", validateAcceptPrivacy(data.acceptPrivacy)],
  ]);
}

export function validateVerificationStep(code: string): StepValidation {
  return collectErrors([["verificationCode", validateVerificationCodeFormat(code)]]);
}

export function validatePersonalDataStep(
  data: RegisterData,
  context: PersonalDataContext,
): StepValidation {
  const entries: Array<[string, ValidationResult]> = [
    ["dni", validateDni(data.dni)],
    ["birthDate", validateBirthDate(data.birthDate)],
    ["nationality", validateNationality(data.nationality)],
    ["cuitCuil", validateCuitCuil(data.cuitCuil)],
    ["address", validateAddress(data.address)],
    ["location", validateLocation(data.location || data.address)],
  ];

  if (context.isAgent) {
    entries.push(
      ["dniFrontImage", validateImageFile(context.dniFrontImage)],
      ["dniBackImage", validateImageFile(context.dniBackImage)],
      ["biometricSelfie", validateImageFile(context.biometricSelfie)],
    );
  }

  return collectErrors(entries);
}

/** Validates only fields persisted in RegisterData (used before API submit). */
export function validatePersonalDataPersistedStep(data: RegisterData): StepValidation {
  return collectErrors([
    ["dni", validateDni(data.dni)],
    ["birthDate", validateBirthDate(data.birthDate)],
    ["nationality", validateNationality(data.nationality)],
    ["cuitCuil", validateCuitCuil(data.cuitCuil)],
    ["address", validateAddress(data.address)],
    ["location", validateLocation(data.location || data.address)],
  ]);
}

export function validateSecurityStep(
  data: RegisterData,
  context: SecurityContext,
): StepValidation {
  return collectErrors([
    ["recoveryEmail", validateRecoveryEmail(data.recoveryEmail)],
    ["recoveryPhone", validateRecoveryPhone(data.recoveryPhone)],
    ["pin", validatePin(data.pin, context.pinEnabled)],
  ]);
}

export function validateProfilePhotoStep(
  context: ProfilePhotoContext,
): StepValidation {
  return collectErrors([["profilePhoto", validateProfilePhotoFile(context.file)]]);
}

export function validateBioStep(bio: string): StepValidation {
  return collectErrors([["bio", validateBio(bio)]]);
}

export function validateAgentEducation(
  fields: AgentProfileContext["education"],
): ValidationResult {
  return validatePartialGroup(
    fields,
    { partial: "Completá todos los campos de estudios", institution: "", degree: "", year: "" },
    {
      institution: (v) => (v.trim() ? { valid: true } : { valid: false, error: "Ingresá la institución" }),
      degree: (v) => (v.trim() ? { valid: true } : { valid: false, error: "Ingresá el título" }),
      year: validateYear,
    },
  );
}

export function validateAgentCertification(
  fields: AgentProfileContext["certification"],
): ValidationResult {
  return validatePartialGroup(
    fields,
    { partial: "Completá todos los campos de certificación", name: "", issuer: "", year: "" },
    {
      name: (v) => (v.trim() ? { valid: true } : { valid: false, error: "Ingresá el nombre de la certificación" }),
      issuer: (v) => (v.trim() ? { valid: true } : { valid: false, error: "Ingresá el emisor" }),
      year: validateYear,
    },
  );
}

export function validateAgentExperience(
  fields: AgentProfileContext["experience"],
): ValidationResult {
  return validatePartialGroup(
    fields,
    { partial: "Completá todos los campos de experiencia", position: "", company: "", years: "" },
    {
      position: (v) => (v.trim() ? { valid: true } : { valid: false, error: "Ingresá el cargo" }),
      company: (v) => (v.trim() ? { valid: true } : { valid: false, error: "Ingresá la empresa" }),
      years: validateExperienceYears,
    },
  );
}

export function validateAgentProfileForms(context: AgentProfileContext): StepValidation {
  const entries: Array<[string, ValidationResult]> = [];

  if (context.education.institution || context.education.degree || context.education.year) {
    entries.push(["education", validateAgentEducation(context.education)]);
  }
  if (context.certification.name || context.certification.issuer || context.certification.year) {
    entries.push(["certification", validateAgentCertification(context.certification)]);
  }
  if (context.experience.position || context.experience.company || context.experience.years) {
    entries.push(["experience", validateAgentExperience(context.experience)]);
  }

  if (entries.length === 0) return { valid: true, errors: {} };
  return collectErrors(entries);
}

export const fieldValidators: Record<string, ValidatorFn> = {
  firstName: (v) => validateFirstName(String(v ?? "")),
  lastName: (v) => validateLastName(String(v ?? "")),
  email: (v) => validateEmail(String(v ?? "")),
  password: (v) => validatePassword(String(v ?? "")),
  acceptTerms: (v) => validateAcceptTerms(Boolean(v)),
  acceptPrivacy: (v) => validateAcceptPrivacy(Boolean(v)),
  verificationCode: (v) => validateVerificationCodeFormat(String(v ?? "")),
  dni: (v) => validateDni(String(v ?? "")),
  birthDate: (v) => validateBirthDate(String(v ?? "")),
  nationality: (v) => validateNationality(String(v ?? "")),
  cuitCuil: (v) => validateCuitCuil(String(v ?? "")),
  address: (v) => validateAddress(String(v ?? "")),
  location: (v) => validateLocation(String(v ?? "")),
  recoveryEmail: (v) => validateRecoveryEmail(String(v ?? "")),
  recoveryPhone: (v) => validateRecoveryPhone(String(v ?? "")),
  bio: (v) => validateBio(String(v ?? "")),
};
