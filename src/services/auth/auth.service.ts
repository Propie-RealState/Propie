import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import { db } from "../../database/client";

import { findUserByEmail } from "../../database/repositories/user.repository";

import type { LoginInput, RegisterInput } from "../../database/types/auth";

import { generateAccessToken, generateRefreshToken } from "./jwt";

import { hashToken } from "./session";

import {
  createProfile,
  findProfileByUserId,
} from "../../modules/profiles/repositories/profiles.repository";

import { buildAuthUserPayload } from "../../modules/profiles/utils/map-profile";

// ========================================================
// REGISTER
// ========================================================

export async function register(input: RegisterInput) {
  // ======================================================
  // CHECK EMAIL
  // ======================================================

  const existingUser = await db.query(
    `
        SELECT id
        FROM users
        WHERE email = $1
      `,
    [input.email],
  );

  if (existingUser.rows.length > 0) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // ======================================================
  // HASH PASSWORD
  // ======================================================

  const passwordHash = await bcrypt.hash(input.password, 10);

  // ======================================================
  // CREATE USER
  // ======================================================

  const insertResult = await db.query<{
    id: string;
  }>(
    `
        INSERT INTO users (
          id,
          first_name,
          last_name,
          email,
          password_hash,
          role
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING id
      `,
    [
      randomUUID(),

      input.firstName,

      input.lastName,

      input.email,

      passwordHash,

      input.role,
    ],
  );

  if (insertResult.rows.length === 0) {
    throw new Error("REGISTRATION_FAILED");
  }

  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error("REGISTRATION_FAILED");
  }
  await createProfile({
    userId: user.id,
    firstName: input.firstName,
    lastName: input.lastName,
  });

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
