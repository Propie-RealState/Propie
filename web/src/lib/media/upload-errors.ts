/** Extracts a user-facing message from API upload errors. */
export function formatUploadError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "No pudimos subir el archivo. Intentá de nuevo.";
  }

  const payload = error as {
    error?: { message?: string };
    message?: string;
  };

  return (
    payload.error?.message ??
    payload.message ??
    "No pudimos subir el archivo. Intentá de nuevo."
  );
}
