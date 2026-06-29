import { findUserById } from "@/database/repositories/user.repository";
import {
  createSession,
  findSessionByTokenHash,
  revokeAllUserSessions,
  revokeSession,
} from "@/database/repositories/session.repository";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./jwt";

import { hashToken } from "./session";
import { isEmailVerificationRequired } from "@/config/email-verification-required";

const REFRESH_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class RefreshSessionError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "RefreshSessionError";
  }
}

export async function refreshSession(refreshToken: string) {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new RefreshSessionError(
      "Invalid refresh token",
      "INVALID_REFRESH_TOKEN",
    );
  }

  const refreshTokenHash = hashToken(refreshToken);
  const session = await findSessionByTokenHash(refreshTokenHash);

  if (!session) {
    throw new RefreshSessionError(
      "Invalid refresh token",
      "INVALID_REFRESH_TOKEN",
    );
  }

  if (payload.sub !== session.userId) {
    await revokeAllUserSessions(session.userId);
    throw new RefreshSessionError(
      "Invalid refresh token",
      "INVALID_REFRESH_TOKEN",
    );
  }

  if (session.isRevoked) {
    await revokeAllUserSessions(session.userId);
    console.warn("[auth] Refresh token reuse detected; revoked all user sessions", {
      userId: session.userId,
      sessionId: session.id,
    });
    throw new RefreshSessionError(
      "Refresh token reuse detected",
      "REFRESH_TOKEN_REUSE",
    );
  }

  if (new Date(session.expiresAt) < new Date()) {
    await revokeSession(session.id);
    throw new RefreshSessionError("Session expired", "SESSION_EXPIRED");
  }

  const user = await findUserById(session.userId);

  if (!user) {
    await revokeAllUserSessions(session.userId);
    throw new RefreshSessionError("User not found", "USER_NOT_FOUND");
  }

  if (user.status === "INACTIVE") {
    await revokeAllUserSessions(user.id);
    throw new RefreshSessionError("Account inactive", "ACCOUNT_INACTIVE");
  }

  if (isEmailVerificationRequired() && !user.isVerified) {
    await revokeAllUserSessions(user.id);
    throw new RefreshSessionError("Email not verified", "EMAIL_NOT_VERIFIED");
  }

  await revokeSession(session.id);

  const tokenInput = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const newAccessToken = generateAccessToken(tokenInput);
  const newRefreshToken = generateRefreshToken(tokenInput);

  await createSession({
    userId: user.id,
    refreshTokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + REFRESH_SESSION_TTL_MS),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
