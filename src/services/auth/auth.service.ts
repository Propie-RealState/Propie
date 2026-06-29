import bcrypt from "bcryptjs";

import { createSession } from "../../database/repositories/session.repository";

import { findUserByEmail } from "../../database/repositories/user.repository";

import type { LoginInput } from "../../database/types/auth";

import { generateAccessToken, generateRefreshToken } from "./jwt";

import { hashToken } from "./session";

import { findProfileByUserId } from "../../modules/profiles/repositories/profiles.repository";

import { buildAuthUserPayload } from "../../modules/profiles/utils/map-profile";
import { isEmailVerificationRequired } from "../../config/email-verification-required";

// ========================================================
// LOGIN
// ========================================================

export async function login(input: LoginInput) {
  // ======================================================
  // FIND USER
  // ======================================================

  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // ======================================================
  // CHECK PASSWORD
  // ======================================================

  const passwordMatch = await bcrypt.compare(
    input.password,

    user.passwordHash,
  );

  if (!passwordMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.status === "INACTIVE") {
    throw new Error("ACCOUNT_INACTIVE");
  }

  if (isEmailVerificationRequired() && !user.isVerified) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  // ======================================================
  // GENERATE TOKENS
  // ======================================================

  const accessToken = generateAccessToken({
    userId: user.id,

    email: user.email,

    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,

    email: user.email,

    role: user.role,
  });

  // ======================================================
  // SAVE SESSION
  // ======================================================

  const refreshTokenHash = hashToken(refreshToken);

  await createSession({
    userId: user.id,
    refreshTokenHash,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // ======================================================
  // REMOVE PASSWORD HASH
  // ======================================================

  const profileRow = await findProfileByUserId(user.id);

  return {
    accessToken,

    refreshToken,

    user: buildAuthUserPayload(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profileRow,
    ),
  };
}
