import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  canAutoSubmitVerification,
  canManualSubmitVerification,
  clearVerificationBlock,
  isRateLimitError,
  mapVerificationError,
  readVerificationBlock,
  shouldTriggerAutoSubmit,
  writeVerificationBlock,
} from "../../web/src/features/register/verification/email-verification";

describe("shouldTriggerAutoSubmit", () => {
  it("fires only when completing the sixth digit", () => {
    expect(shouldTriggerAutoSubmit("", "123456")).toBe(true);
    expect(shouldTriggerAutoSubmit("12345", "123456")).toBe(true);
    expect(shouldTriggerAutoSubmit("123456", "123456")).toBe(false);
    expect(shouldTriggerAutoSubmit("123456", "12345")).toBe(false);
  });
});

describe("verification block storage", () => {
  beforeEach(() => {
    const store = new Map<string, string>();

    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists and clears blocked codes per email", () => {
    writeVerificationBlock("user@test.com", "123456");
    expect(readVerificationBlock("user@test.com")).toBe("123456");
    clearVerificationBlock("user@test.com");
    expect(readVerificationBlock("user@test.com")).toBeNull();
  });
});

describe("email verification submission guards", () => {
  it("allows auto submit only once per code", () => {
    const base = {
      code: "123456",
      emailVerified: false,
      isSubmitting: false,
      lastSubmittedCode: null as string | null,
      rateLimited: false,
    };

    expect(canAutoSubmitVerification(base)).toBe(true);
    expect(
      canAutoSubmitVerification({ ...base, lastSubmittedCode: "123456" }),
    ).toBe(false);
  });

  it("blocks auto submit while submitting", () => {
    expect(
      canAutoSubmitVerification({
        code: "123456",
        emailVerified: false,
        isSubmitting: true,
        lastSubmittedCode: null,
        rateLimited: false,
      }),
    ).toBe(false);
  });

  it("blocks auto submit when rate limited", () => {
    expect(
      canAutoSubmitVerification({
        code: "123456",
        emailVerified: false,
        isSubmitting: false,
        lastSubmittedCode: null,
        rateLimited: true,
      }),
    ).toBe(false);
  });

  it("allows manual submit while rate limited", () => {
    expect(
      canManualSubmitVerification({
        code: "123456",
        emailVerified: false,
        isSubmitting: false,
      }),
    ).toBe(true);
  });

  it("blocks manual submit while submitting", () => {
    expect(
      canManualSubmitVerification({
        code: "123456",
        emailVerified: false,
        isSubmitting: true,
      }),
    ).toBe(false);
  });
});

describe("mapVerificationError", () => {
  it("maps invalid verification code", () => {
    expect(
      mapVerificationError({
        error: { code: "INVALID_VERIFICATION_CODE" },
      }),
    ).toContain("incorrecto");
  });

  it("maps rate limit responses", () => {
    expect(mapVerificationError({ statusCode: 429 })).toContain("Demasiados intentos");
    expect(
      mapVerificationError({ error: { code: "TOO_MANY_REQUESTS" } }),
    ).toContain("Demasiados intentos");
  });
});

describe("isRateLimitError", () => {
  it("detects HTTP 429 payloads", () => {
    expect(isRateLimitError({ statusCode: 429 })).toBe(true);
    expect(isRateLimitError({ error: { code: "INVALID_VERIFICATION_CODE" } })).toBe(
      false,
    );
  });
});
