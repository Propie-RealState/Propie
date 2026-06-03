/**
 * Module-level store for the avatar File selected during the multi-step
 * registration flow. File objects cannot be serialised to sessionStorage,
 * so we keep the reference here until registration completes.
 *
 * Cleared immediately after the post-registration upload attempt (success or failure).
 */
let pendingFile: File | null = null;

export function setPendingAvatarFile(file: File | null): void {
  pendingFile = file;
}

export function getPendingAvatarFile(): File | null {
  return pendingFile;
}

export function clearPendingAvatarFile(): void {
  pendingFile = null;
}
