/**
 * Shared registration validation contract (plain data only — no Zod).
 * Backend API limits are the source of truth; UI-stricter gates document
 * intentional frontend-only constraints (Ticket 1.5).
 */

export const registerApiLimits = {
  firstName: { min: 2, max: 100 },
  lastName: { min: 2, max: 100 },
  email: { max: 255 },
  password: { min: 8, max: 100 },
  dni: { min: 7, max: 12 },
  nationality: { min: 2, max: 100 },
  cuitCuil: { min: 10, max: 15 },
  address: { min: 5, max: 255 },
  location: { min: 2, max: 255 },
  phone: { min: 8, max: 20 },
  bio: { max: 300 },
  mainGoals: ["PUBLISH", "EXPLORE"] as const,
} as const;

/**
 * FE-only gates stricter than (or outside) the API schema.
 * Do not loosen these without an explicit product decision.
 */
export const registerUiStricterLimits = {
  firstNameMax: 50,
  lastNameMax: 50,
  dniMax: 8,
  cuitCuilLength: 11,
  recoveryPhoneMin: 10,
  minAge: 18,
  pinLength: 4,
  verificationCodeLength: 6,
  maxImageBytes: 10 * 1024 * 1024,
} as const;
