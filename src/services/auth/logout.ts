import {
  findSessionByTokenHash,
  revokeSession,
} from "@/database/repositories/session.repository";

import { verifyRefreshToken } from "./jwt";

import { hashToken } from "./session";

export async function logoutSession(refreshToken: string) {
  try {
    verifyRefreshToken(refreshToken);
  } catch {
    return { success: true };
  }

  const session = await findSessionByTokenHash(hashToken(refreshToken));

  if (!session || session.isRevoked) {
    return { success: true };
  }

  await revokeSession(session.id);

  return { success: true };
}
