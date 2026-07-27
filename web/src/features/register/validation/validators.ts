import {
  registerApiLimits,
  registerUiStricterLimits,
} from "@propie/registration-validation";
import { validationMessages } from "./messages";

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

const NAME_PATTERN = /^[\p{L}\s\u00C0-\u024F'-]+$/u;
/** Closer to Zod/HTML email than the previous loose pattern; rejects spaces and consecutive dots. */
const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+.-]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const DIGITS_ONLY = /^\d+$/;

const api = registerApiLimits;
const ui = registerUiStricterLimits;

export const MAX_IMAGE_BYTES = ui.maxImageBytes;
export const PROFILE_PHOTO_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export const currentYear = () => new Date().getFullYear();

export function validResult(): ValidationResult {
  return { valid: true };
}

export function invalidResult(error: string): ValidationResult {
  return { valid: false, error };
}

export function validateFirstName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return invalidResult(validationMessages.required);
  if (trimmed.length < api.firstName.min) {
    return invalidResult(validationMessages.firstName.min);
  }
  if (trimmed.length > ui.firstNameMax) {
    return invalidResult(validationMessages.firstName.max);
  }
  if (!NAME_PATTERN.test(trimmed)) return invalidResult(validationMessages.firstName.format);
  return validResult();
}

export function validateLastName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return invalidResult(validationMessages.required);
  if (trimmed.length < api.lastName.min) {
    return invalidResult(validationMessages.lastName.min);
  }
  if (trimmed.length > ui.lastNameMax) {
    return invalidResult(validationMessages.lastName.max);
  }
  if (!NAME_PATTERN.test(trimmed)) return invalidResult(validationMessages.lastName.format);
  return validResult();
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validateEmailFormat(
  value: string,
  formatMessage: string,
): ValidationResult {
  const normalized = normalizeEmail(value);
  if (!normalized) return invalidResult(validationMessages.required);
  if (normalized.length > api.email.max) {
    return invalidResult(validationMessages.email.max);
  }
  if (!EMAIL_PATTERN.test(normalized)) return invalidResult(formatMessage);
  return validResult();
}

export function validateEmail(value: string): ValidationResult {
  return validateEmailFormat(value, validationMessages.email.format);
}

export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) return "empty";
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  const criteria = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (value.length >= api.password.min && criteria === 4) return "strong";
  if (value.length >= api.password.min && criteria >= 2) return "medium";
  return "weak";
}

export function validatePassword(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (value.length < api.password.min) {
    return invalidResult(validationMessages.password.min);
  }
  if (value.length > api.password.max) {
    return invalidResult(validationMessages.password.max);
  }
  return validResult();
}

export function validateAcceptTerms(value: boolean): ValidationResult {
  return value ? validResult() : invalidResult(validationMessages.acceptTerms);
}

export function validateAcceptPrivacy(value: boolean): ValidationResult {
  return value ? validResult() : invalidResult(validationMessages.acceptPrivacy);
}

export function validateVerificationCode(value: string): ValidationResult {
  return validateVerificationCodeFormat(value);
}

export function validateVerificationCodeFormat(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (!DIGITS_ONLY.test(value) || value.length !== ui.verificationCodeLength) {
    return invalidResult(validationMessages.verificationCode.format);
  }
  return validResult();
}

export function validateDni(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (
    !DIGITS_ONLY.test(value) ||
    value.length < api.dni.min ||
    value.length > ui.dniMax
  ) {
    return invalidResult(validationMessages.dni.format);
  }
  return validResult();
}

export function validateBirthDate(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return invalidResult(validationMessages.birthDate.invalid);
  }
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  if (age < ui.minAge) return invalidResult(validationMessages.birthDate.underage);
  return validResult();
}

export function validateNationality(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return invalidResult(validationMessages.required);
  if (trimmed.length < api.nationality.min) {
    return invalidResult(validationMessages.nationality.min);
  }
  if (trimmed.length > api.nationality.max) {
    return invalidResult(validationMessages.nationality.max);
  }
  return validResult();
}

export function validateCuitCuil(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (!DIGITS_ONLY.test(value) || value.length !== ui.cuitCuilLength) {
    return invalidResult(validationMessages.cuitCuil.format);
  }
  return validResult();
}

export function validateAddress(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return invalidResult(validationMessages.required);
  if (trimmed.length < api.address.min) {
    return invalidResult(validationMessages.address.min);
  }
  if (trimmed.length > api.address.max) {
    return invalidResult(validationMessages.address.max);
  }
  return validResult();
}

export function validateLocation(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return invalidResult(validationMessages.required);
  if (trimmed.length < api.location.min) {
    return invalidResult(validationMessages.location.min);
  }
  if (trimmed.length > api.location.max) {
    return invalidResult(validationMessages.location.max);
  }
  return validResult();
}

export function validateImageFile(file: File | null | undefined): ValidationResult {
  if (!file) return invalidResult(validationMessages.image.required);
  if (!IMAGE_TYPES.includes(file.type)) {
    return invalidResult(validationMessages.image.type);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return invalidResult(validationMessages.image.size);
  }
  return validResult();
}

export function validateProfilePhotoFile(file: File | null | undefined): ValidationResult {
  if (!file) return validResult();
  if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
    return invalidResult(validationMessages.profilePhoto.type);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return invalidResult(validationMessages.profilePhoto.size);
  }
  return validResult();
}

export function validatePhone(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (!DIGITS_ONLY.test(value) || value.length < ui.phoneMin) {
    return invalidResult(validationMessages.phone.format);
  }
  if (value.length > api.phone.max) {
    return invalidResult(validationMessages.phone.max);
  }
  return validResult();
}

export function validateBio(value: string): ValidationResult {
  if (value.length > api.bio.max) return invalidResult(validationMessages.bio.max);
  return validResult();
}

export function validateYear(value: string): ValidationResult {
  if (!value.trim()) return invalidResult(validationMessages.education.year);
  if (!DIGITS_ONLY.test(value)) return invalidResult(validationMessages.education.year);
  const year = Number(value);
  if (year < 1900 || year > currentYear()) {
    return invalidResult(validationMessages.education.year);
  }
  return validResult();
}

export function validateExperienceYears(value: string): ValidationResult {
  if (!value.trim()) return invalidResult(validationMessages.experience.years);
  if (!DIGITS_ONLY.test(value)) return invalidResult(validationMessages.experience.years);
  const years = Number(value);
  if (years < 0 || years > 60) return invalidResult(validationMessages.experience.years);
  return validResult();
}

export function validatePartialGroup(
  fields: Record<string, string>,
  messages: { partial: string; [key: string]: string },
  validators: Record<string, (v: string) => ValidationResult>,
): ValidationResult {
  const values = Object.values(fields);
  const anyFilled = values.some((v) => v.trim().length > 0);
  if (!anyFilled) return validResult();

  for (const [key, validator] of Object.entries(validators)) {
    const result = validator(fields[key] ?? "");
    if (!result.valid) return result;
  }
  return validResult();
}
