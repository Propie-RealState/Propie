function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isE2eCaptureVerificationEnabled(): boolean {
  if (isProductionEnvironment()) {
    return false;
  }

  return process.env.E2E_CAPTURE_VERIFICATION === "true";
}

export function assertE2eCaptureVerificationSafe(): void {
  if (
    isProductionEnvironment() &&
    process.env.E2E_CAPTURE_VERIFICATION === "true"
  ) {
    throw new Error(
      "E2E_CAPTURE_VERIFICATION cannot be enabled when NODE_ENV=production",
    );
  }
}
