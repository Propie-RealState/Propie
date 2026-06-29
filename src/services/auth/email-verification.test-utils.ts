import { readFileSync } from "node:fs";
import { join } from "node:path";

import { isE2eCaptureVerificationEnabled } from "@/config/e2e-capture-verification";

export function readCapturedVerificationCode(email: string): string | null {
  if (!isE2eCaptureVerificationEnabled()) {
    return null;
  }

  try {
    return readFileSync(
      join(process.cwd(), "e2e", ".verification-codes", `${email.trim().toLowerCase()}.code`),
      "utf8",
    ).trim();
  } catch {
    return null;
  }
}
