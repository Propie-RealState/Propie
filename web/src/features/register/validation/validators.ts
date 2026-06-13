import { validationMessages } from "./messages";

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

const NAME_PATTERN = /^[\p{L}\s\u00C0-\u024F'-]+$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_ONLY = /^\d+$/;

export const MOCK_VERIFICATION_CODE = "123456";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
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
  if (trimmed.length < 2) return invalidResult(validationMessages.firstName.min);
  if (trimmed.length > 50) return invalidResult(validationMessages.firstName.max);
  if (!NAME_PATTERN.test(trimmed)) return invalidResult(validationMessages.firstName.format);
  return validResult();
}

export function validateLastName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return invalidResult(validationMessages.required);
  if (trimmed.length < 2) return invalidResult(validationMessages.lastName.min);
  if (trimmed.length > 50) return invalidResult(validationMessages.lastName.max);
  if (!NAME_PATTERN.test(trimmed)) return invalidResult(validationMessages.lastName.format);
  return validResult();
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateEmail(value: string): ValidationResult {
  const normalized = normalizeEmail(value);
  if (!normalized) return invalidResult(validationMessages.required);
  if (!EMAIL_PATTERN.test(normalized)) return invalidResult(validationMessages.email.format);
  return validResult();
}

export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) return "empty";
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  const criteria = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (value.length >= 8 && criteria === 4) return "strong";
  if (value.length >= 8 && criteria >= 2) return "medium";
  return "weak";
}

export function validatePassword(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (value.length < 8) return invalidResult(validationMessages.password.min);
  if (value.length > 100) return invalidResult(validationMessages.password.max);
  return validResult();
}

export function validateAcceptTerms(value: boolean): ValidationResult {
  return value ? validResult() : invalidResult(validationMessages.acceptTerms);
}

export function validateAcceptPrivacy(value: boolean): ValidationResult {
  return value ? validResult() : invalidResult(validationMessages.acceptPrivacy);
}

export function validateVerificationCode(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (!DIGITS_ONLY.test(value) || value.length !== 6) {
    return invalidResult(validationMessages.verificationCode.format);
  }
  if (value !== MOCK_VERIFICATION_CODE) {
    return invalidResult(validationMessages.verificationCode.invalid);
  }
  return validResult();
}

export function validateVerificationCodeFormat(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (!DIGITS_ONLY.test(value) || value.length !== 6) {
    return invalidResult(validationMessages.verificationCode.format);
  }
  return validResult();
}

export function validateDni(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (!DIGITS_ONLY.test(value) || value.length < 7 || value.length > 8) {
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
  if (age < 18) return invalidResult(validationMessages.birthDate.underage);
  return validResult();
}

export function validateNationality(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return invalidResult(validationMessages.required);
  if (trimmed.length < 2) return invalidResult(validationMessages.nationality.min);
  return validResult();
}

export function validateCuitCuil(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (!DIGITS_ONLY.test(value) || value.length !== 11) {
    return invalidResult(validationMessages.cuitCuil.format);
  }
  return validResult();
}

export function validateAddress(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return invalidResult(validationMessages.required);
  if (trimmed.length < 5) return invalidResult(validationMessages.address.min);
  if (trimmed.length > 255) return invalidResult(validationMessages.address.max);
  return validResult();
}

export function validateLocation(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return invalidResult(validationMessages.required);
  if (trimmed.length < 2) return invalidResult(validationMessages.location.min);
  if (trimmed.length > 255) return invalidResult(validationMessages.location.max);
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

export function validateRecoveryEmail(value: string): ValidationResult {
  const normalized = normalizeEmail(value);
  if (!normalized) return invalidResult(validationMessages.required);
  if (!EMAIL_PATTERN.test(normalized)) {
    return invalidResult(validationMessages.recoveryEmail.format);
  }
  return validResult();
}

export function validateRecoveryPhone(value: string): ValidationResult {
  if (!value) return invalidResult(validationMessages.required);
  if (!DIGITS_ONLY.test(value) || value.length < 10) {
    return invalidResult(validationMessages.recoveryPhone.format);
  }
  return validResult();
}

export function validatePin(value: string, enabled: boolean): ValidationResult {
  if (!enabled) return validResult();
  if (!value) return invalidResult(validationMessages.required);
  if (!DIGITS_ONLY.test(value) || value.length !== 4) {
    return invalidResult(validationMessages.pin.format);
  }
  return validResult();
}

export function validateBio(value: string): ValidationResult {
  if (value.length > 300) return invalidResult(validationMessages.bio.max);
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
