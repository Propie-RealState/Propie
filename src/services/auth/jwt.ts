import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import crypto from 'node:crypto';

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

// Short-lived, read-only capability token used exclusively to authorize
// browser <img>/<video> requests to /media/* (which cannot send an
// Authorization header). Scope-locked so a leaked media URL cannot be replayed
// against the regular API.
const MEDIA_TOKEN_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.MEDIA_TOKEN_EXPIRES_IN ?? '10m') as SignOptions['expiresIn'];

const MEDIA_TOKEN_SCOPE = 'media';

function mediaTokenSecret(): string {
  // Prefer a dedicated secret so media tokens are cryptographically distinct
  // from access tokens; fall back to JWT_SECRET for zero-config environments.
  return process.env.JWT_MEDIA_SECRET ?? process.env.JWT_SECRET!;
}



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

      jti: crypto.randomUUID(),
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



// ========================================================
// MEDIA CAPABILITY TOKEN
// ========================================================

export type MediaTokenPayload = {
  sub: string;
  role: string;
  scope: typeof MEDIA_TOKEN_SCOPE;
  iat: number;
  exp: number;
};

export function generateMediaToken(input: {
  userId: string;
  role: string;
}): string {
  return jwt.sign(
    {
      sub: input.userId,
      role: input.role,
      scope: MEDIA_TOKEN_SCOPE,
    },
    mediaTokenSecret(),
    {
      expiresIn: MEDIA_TOKEN_EXPIRES_IN,
    },
  );
}

export function verifyMediaToken(
  token: string,
): MediaTokenPayload {
  const payload = jwt.verify(
    token,
    mediaTokenSecret(),
  ) as MediaTokenPayload;

  if (payload.scope !== MEDIA_TOKEN_SCOPE) {
    throw new Error('INVALID_MEDIA_TOKEN_SCOPE');
  }

  return payload;
}