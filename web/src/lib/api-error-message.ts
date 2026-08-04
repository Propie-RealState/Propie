/**
 * Extract a user-facing message from apiFetch failures.
 * apiFetch throws the parsed JSON body on non-OK responses.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const body = error as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof body.error === "object" && body.error !== null) {
      const nested = body.error as { message?: unknown };
      if (typeof nested.message === "string" && nested.message.trim()) {
        return nested.message;
      }
    }

    if (typeof body.message === "string" && body.message.trim()) {
      return body.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
