import bcrypt from 'bcryptjs';

import {
  findUserById,
} from '@/database/repositories/user.repository';

import {
  findSessionByTokenHash,
} from '@/database/repositories/session.repository';

import {
  verifyRefreshToken,
} from './jwt';

import {
  createUser,
  findUserByEmail,
} from '@/database/repositories/user.repository';

import {
  createSession,
} from '@/database/repositories/session.repository';

import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from '@/database/types/auth';

import {
  generateAccessToken,
  generateRefreshToken,
} from './jwt';

import {
  revokeSession,
} from '@/database/repositories/session.repository';


// ========================================================
// HASH TOKEN
// ========================================================

async function hashToken(
  token: string
): Promise<string> {
  return bcrypt.hash(token, 10);
}



// ========================================================
// REGISTER
// ========================================================

export async function register(
  input: RegisterInput
): Promise<AuthResponse> {
  const existingUser =
    await findUserByEmail(
      input.email
    );

  if (existingUser) {
    throw new Error(
      'EMAIL_ALREADY_EXISTS'
    );
  }

  const passwordHash =
    await bcrypt.hash(
      input.password,
      10
    );

  const user =
    await createUser({
      firstName:
        input.firstName,

      lastName:
        input.lastName,

      email: input.email,

      passwordHash,
    });

  const accessToken =
    generateAccessToken({
      userId: user.id,

      email: user.email,

      role: user.role,
    });

  const refreshToken =
    generateRefreshToken(
      user.id
    );

  const refreshTokenHash =
    await hashToken(
      refreshToken
    );

  const refreshTokenExpiresAt =
    new Date(
      Date.now() +
      1000 * 60 * 60 * 24 * 30
    );

  await createSession({
    userId: user.id,

    refreshTokenHash,

    expiresAt:
      refreshTokenExpiresAt,
  });

  return {
    accessToken,

    refreshToken,

    user,
  };
}



// ========================================================
// LOGIN
// ========================================================

export async function login(
  input: LoginInput
): Promise<AuthResponse> {
  const user =
    await findUserByEmail(
      input.email
    );

  if (!user) {
    throw new Error(
      'INVALID_CREDENTIALS'
    );
  }

  const isPasswordValid =
    await bcrypt.compare(
      input.password,
      user.passwordHash
    );

  if (!isPasswordValid) {
    throw new Error(
      'INVALID_CREDENTIALS'
    );
  }

  const accessToken =
    generateAccessToken({
      userId: user.id,

      email: user.email,

      role: user.role,
    });

  const refreshToken =
    generateRefreshToken(
      user.id
    );

  const refreshTokenHash =
    await hashToken(
      refreshToken
    );

  const refreshTokenExpiresAt =
    new Date(
      Date.now() +
      1000 * 60 * 60 * 24 * 30
    );

  await createSession({
    userId: user.id,

    refreshTokenHash,

    expiresAt:
      refreshTokenExpiresAt,
  });

  return {
    accessToken,

    refreshToken,

    user: {
      id: user.id,

      firstName:
        user.firstName,

      lastName:
        user.lastName,

      email: user.email,

      phone: user.phone,

      avatarUrl:
        user.avatarUrl,

      bio: user.bio,

      role: user.role,

      status: user.status,

      isVerified:
        user.isVerified,

      createdAt:
        user.createdAt,

      updatedAt:
        user.updatedAt,
    },
  };

}

// ========================================================
// REFRESH ACCESS TOKEN
// ========================================================

export async function refreshAccessToken(
  refreshToken: string
): Promise<AuthResponse> {
  const payload =
    verifyRefreshToken(
      refreshToken
    );

  const user =
    await findUserById(
      payload.sub
    );

  if (!user) {
    throw new Error(
      'USER_NOT_FOUND'
    );
  }

  const session =
    await findSessionByTokenHash(
      refreshToken
    );

  if (!session) {
    throw new Error(
      'INVALID_SESSION'
    );
  }

  if (session.isRevoked) {
    throw new Error(
      'SESSION_REVOKED'
    );
  }

  const isExpired =
    new Date(
      session.expiresAt
    ) < new Date();

  if (isExpired) {
    throw new Error(
      'SESSION_EXPIRED'
    );
  }

  const newAccessToken =
    generateAccessToken({
      userId: user.id,

      email: user.email,

      role: user.role,
    });

  const newRefreshToken =
    generateRefreshToken(
      user.id
    );

  return {
    accessToken:
      newAccessToken,

    refreshToken:
      newRefreshToken,

    user,
  };
}

// ========================================================
// LOGOUT
// ========================================================

export async function logout(
  sessionId: string
): Promise<void> {
  await revokeSession(
    sessionId
  );
}