import { z } from "zod";

// ========================================================
// PASSWORD
// ========================================================

export const PasswordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(100)
  .regex(/[A-Z]/, "Password must contain one uppercase letter")
  .regex(/[a-z]/, "Password must contain one lowercase letter")
  .regex(/[0-9]/, "Password must contain one number")
  .regex(/[!@#$%^&*]/, "Password must contain one special character")
  .transform((value) => value.trim());

// ========================================================
// LOGIN
// ========================================================

export const LoginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase().trim()),

  password: z.string(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ========================================================
// REFRESH / LOGOUT
// ========================================================

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

// ========================================================
// PASSWORD RESET
// ========================================================

export const ForgotPasswordSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase().trim()),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string(),

  password: PasswordSchema,
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ========================================================
// EMAIL VERIFICATION
// ========================================================

export const VerifyEmailSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase().trim()),

  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

export const ResendVerificationSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase().trim()),
});

export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;
