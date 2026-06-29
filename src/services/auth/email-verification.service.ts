import crypto from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getEmailVerificationExpiryMs } from "@/config/email-verification";
import { isE2eCaptureVerificationEnabled } from "@/config/e2e-capture-verification";
import {
  createEmailVerificationToken,
  findLatestEmailVerificationToken,
  findValidEmailVerificationToken,
  invalidateEmailVerificationTokensForUser,
  markEmailVerificationTokenUsed,
} from "@/database/repositories/email-verification.repository";
import {
  findUserByEmail,
  verifyUserEmail,
} from "@/database/repositories/user.repository";
import {
  EMAIL_TEMPLATE,
  NOTIFICATION_CHANNELS,
  notificationService,
} from "@/notifications";

import { hashToken } from "./session";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateVerificationCode(): string {
  return crypto.randomInt(100_000, 1_000_000).toString();
}

function captureVerificationCodeForE2e(email: string, code: string): void {
  if (!isE2eCaptureVerificationEnabled()) {
    return;
  }

  const dir = join(process.cwd(), "e2e", ".verification-codes");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${normalizeEmail(email)}.code`), code, "utf8");
}

export async function issueEmailVerificationCode(input: {
  userId: string;
  email: string;
  firstName: string;
}): Promise<void> {
  const code = generateVerificationCode();
  const tokenHash = hashToken(code);

  await invalidateEmailVerificationTokensForUser(input.userId);

  await createEmailVerificationToken({
    userId: input.userId,
    tokenHash,
    expiresAt: new Date(Date.now() + getEmailVerificationExpiryMs()),
  });

  captureVerificationCodeForE2e(input.email, code);

  await notificationService.send({
    channel: NOTIFICATION_CHANNELS.EMAIL,
    template: EMAIL_TEMPLATE.VERIFY_EMAIL,
    recipient: input.email,
    payload: {
      firstName: input.firstName,
      code,
      expiresInMinutes: Math.round(getEmailVerificationExpiryMs() / 60_000),
    },
  });
}

export async function verifyEmailWithCode(input: {
  email: string;
  code: string;
}): Promise<void> {
  const email = normalizeEmail(input.email);
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("INVALID_VERIFICATION_CODE");
  }

  if (user.isVerified) {
    throw new Error("EMAIL_ALREADY_VERIFIED");
  }

  if (user.status === "INACTIVE") {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const tokenHash = hashToken(input.code.trim());
  const validToken = await findValidEmailVerificationToken({
    userId: user.id,
    tokenHash,
  });

  if (validToken) {
    await markEmailVerificationTokenUsed(validToken.id);
    await verifyUserEmail(user.id);
    return;
  }

  const latestToken = await findLatestEmailVerificationToken(user.id);

  if (!latestToken) {
    throw new Error("VERIFICATION_NOT_FOUND");
  }

  if (latestToken.verified_at) {
    throw new Error("VERIFICATION_CODE_ALREADY_USED");
  }

  if (new Date(latestToken.expires_at) <= new Date()) {
    throw new Error("VERIFICATION_CODE_EXPIRED");
  }

  throw new Error("INVALID_VERIFICATION_CODE");
}

export async function resendEmailVerificationCode(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const user = await findUserByEmail(normalized);

  if (!user) {
    return;
  }

  if (user.isVerified) {
    throw new Error("EMAIL_ALREADY_VERIFIED");
  }

  if (user.status === "INACTIVE") {
    throw new Error("ACCOUNT_INACTIVE");
  }

  await issueEmailVerificationCode({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
  });
}
