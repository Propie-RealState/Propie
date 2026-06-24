import { z } from 'zod';
import { UserStatusSchema } from './users';
import { UserRoleSchema, RegisterableUserRoleSchema } from './roles';

// ========================================================
// PASSWORD
// ========================================================

export const PasswordSchema = z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must contain one uppercase letter')
    .regex(/[a-z]/, 'Password must contain one lowercase letter')
    .regex(/[0-9]/, 'Password must contain one number')
    .regex(/[!@#$%^&*]/, 'Password must contain one special character')
    .transform((value) => value.trim());



// ========================================================
// REGISTER
// ========================================================

export const RegisterSchema = z.object({
    firstName: z
        .string()
        .min(2)
        .max(100),

    lastName: z
        .string()
        .min(2)
        .max(100),

    email: z
        .string()
        .email()
        .max(255)
        .transform((value) =>
            value.toLowerCase().trim()
        ),

    password: PasswordSchema,

    role: RegisterableUserRoleSchema,
});

export type RegisterInput =
    z.infer<typeof RegisterSchema>;



// ========================================================
// LOGIN
// ========================================================

export const LoginSchema = z.object({
    email: z
        .email()
        .transform((value) =>
            value.toLowerCase().trim()
        ),

    password: z.string(),
});

export type LoginInput =
    z.infer<typeof LoginSchema>;



// ========================================================
// JWT PAYLOAD
// ========================================================

export const JwtPayloadSchema = z.object({
    sub: z.uuid(),

    email: z.email(),

    role: UserRoleSchema,

    iat: z.number(),

    exp: z.number(),
});

export type JwtPayload =
    z.infer<typeof JwtPayloadSchema>;



// ========================================================
// AUTH USER
// ========================================================

export const AuthUserSchema = z.object({
    id: z.uuid(),

    firstName: z.string(),

    lastName: z.string(),

    email: z.email(),

    avatarUrl: z.string().nullable(),

    role: UserRoleSchema,

    phone: z.string().nullable(),

    bio: z.string().nullable(),

    isVerified: z.boolean(),

    createdAt: z.string(),

    status: UserStatusSchema,

    updatedAt: z.iso.datetime(),
});

export type AuthUser =
    z.infer<typeof AuthUserSchema>;



// ========================================================
// AUTH RESPONSE
// ========================================================

export const AuthResponseSchema = z.object({
    accessToken: z.string(),

    refreshToken: z.string(),

    user: AuthUserSchema,

});

export type AuthResponse =
    z.infer<typeof AuthResponseSchema>;



// ========================================================
// REFRESH TOKEN
// ========================================================

export const RefreshTokenSchema = z.object({
    refreshToken: z.string(),
});

export type RefreshTokenInput =
    z.infer<typeof RefreshTokenSchema>;

export const ForgotPasswordSchema = z.object({
    email: z
        .email()
        .transform((value) =>
            value.toLowerCase().trim()
        ),
});

export type ForgotPasswordInput =
    z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
    token: z.string(),

    password: PasswordSchema,
});

export type ResetPasswordInput =
    z.infer<typeof ResetPasswordSchema>;

export const VerifyEmailSchema = z.object({
    token: z.string(),
});

export type VerifyEmailInput =
    z.infer<typeof VerifyEmailSchema>;

export const SessionSchema = z.object({
    id: z.uuid(),

    userId: z.uuid(),

    refreshToken: z.string(),

    ipAddress: z.string().nullable(),

    userAgent: z.string().nullable(),

    expiresAt: z.iso.datetime(),

    createdAt: z.iso.datetime(),

    isRevoked: z.boolean().default(false),
});

export type Session =
    z.infer<typeof SessionSchema>;

export const PermissionSchema = z.enum([
    'PROPERTY_CREATE',
    'PROPERTY_UPDATE',
    'PROPERTY_DELETE',

    'PROPERTY_ASSIGN_AGENT',

    'PROPERTY_VIEW_PRIVATE',

    'APPLICATION_CREATE',

    'APPLICATION_ACCEPT',

    'APPLICATION_REJECT',
]);

export type Permission =
    z.infer<typeof PermissionSchema>;