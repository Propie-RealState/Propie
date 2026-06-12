import crypto from "node:crypto";

import { hashPassword } from "@/modules/auth/utils/hash-password";

import {
  findUserByEmail,
  updateUserPassword,
} from "@/database/repositories/user.repository";
import { deleteAllUserSessions } from "@/database/repositories/session.repository";
import {
  createPasswordResetToken,
  findValidPasswordResetToken,
  invalidatePasswordResetTokensForUser,
  markPasswordResetTokenUsed,
} from "@/database/repositories/password-reset.repository";

import { hashToken } from "./session";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await findUserByEmail(email);

  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  await invalidatePasswordResetTokensForUser(user.id);

  await createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
  });

  // Email delivery is out of scope for MVP; token is stored hashed only.
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
}): Promise<void> {
  const tokenHash = hashToken(input.token.trim());
  const record = await findValidPasswordResetToken(tokenHash);

  if (!record) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  const passwordHash = await hashPassword(input.password);

  await updateUserPassword(record.user_id, passwordHash);
  await markPasswordResetTokenUsed(record.id);
  await deleteAllUserSessions(record.user_id);
}
