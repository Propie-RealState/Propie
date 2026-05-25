import jwt from 'jsonwebtoken';

import type {
  JwtPayload,
} from '@/database/types/auth';



// ========================================================
// JWT CONFIG
// ========================================================

const ACCESS_TOKEN_EXPIRES_IN =
  '15m';

const REFRESH_TOKEN_EXPIRES_IN =
  '30d';



// ========================================================
// TOKEN PAYLOAD
// ========================================================

type TokenInput = {
  userId: string;

  email: string;

  role: string;
};



// ========================================================
// GENERATE ACCESS TOKEN
// ========================================================

export function generateAccessToken(
  input: TokenInput
): string {
  return jwt.sign(
    {
      sub: input.userId,

      email: input.email,

      role: input.role,
    },

    process.env.JWT_SECRET!,

    {
      expiresIn:
        ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}



// ========================================================
// GENERATE REFRESH TOKEN
// ========================================================

export function generateRefreshToken(
  input: TokenInput
): string {
  return jwt.sign(
    {
      sub: input.userId,

      email: input.email,

      role: input.role,
    },

    process.env.JWT_REFRESH_SECRET!,

    {
      expiresIn:
        REFRESH_TOKEN_EXPIRES_IN,
    }
  );
}



// ========================================================
// VERIFY ACCESS TOKEN
// ========================================================

export function verifyAccessToken(
  token: string
): JwtPayload {
  return jwt.verify(
    token,

    process.env.JWT_SECRET!
  ) as JwtPayload;
}



// ========================================================
// VERIFY REFRESH TOKEN
// ========================================================

export function verifyRefreshToken(
  token: string
): JwtPayload {
  return jwt.verify(
    token,

    process.env.JWT_REFRESH_SECRET!
  ) as JwtPayload;
}