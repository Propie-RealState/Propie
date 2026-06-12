import bcrypt from "bcryptjs";

import { db } from "../../database/client";

import { findUserByEmail } from "../../database/repositories/user.repository";

import type { LoginInput } from "../../database/types/auth";

import { generateAccessToken, generateRefreshToken } from "./jwt";

import { hashToken } from "./session";

import { findProfileByUserId } from "../../modules/profiles/repositories/profiles.repository";

import { buildAuthUserPayload } from "../../modules/profiles/utils/map-profile";

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

  await db.query(
    `
      INSERT INTO sessions (
        user_id,
        refresh_token_hash,
        expires_at
      )
      VALUES (
        $1,
        $2,
        NOW() + interval '30 days'
      )
    `,
    [user.id, refreshTokenHash],
  );

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
