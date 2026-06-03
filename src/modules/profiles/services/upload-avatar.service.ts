import sharp from "sharp";
import { uploadToStorage, deleteFromStorage } from "@/lib/supabase";
import { findProfileByUserId, updateAvatarUrl } from "../repositories/profiles.repository";

const AVATAR_SIZE = 256;
const AVATAR_QUALITY = 80;
const AVATAR_CACHE_CONTROL = "3600"; // 1 hour — same path may be overwritten on update

/**
 * Process and store a new avatar for the given user.
 * Resizes to a 256×256 square (cover crop), converts to WebP, uploads to Supabase,
 * and updates profiles.avatar_url. Deletes the previous Supabase avatar if present.
 */
export async function uploadAvatarService(
  userId: string,
  rawBuffer: Buffer,
): Promise<string> {
  const avatarBuffer = await sharp(rawBuffer)
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "center" })
    .webp({ quality: AVATAR_QUALITY })
    .toBuffer();

  // Overwrite the previous avatar file (same path) for zero orphan accumulation.
  const storagePath = `avatars/${userId}.webp`;

  // Delete the previous Supabase avatar first (best-effort; may be a legacy data: URI).
  const existing = await findProfileByUserId(userId);
  if (existing?.avatar_url) {
    await deleteFromStorage(existing.avatar_url);
  }

  const publicUrl = await uploadToStorage(
    storagePath,
    avatarBuffer,
    "image/webp",
    AVATAR_CACHE_CONTROL,
  );

  await updateAvatarUrl(userId, publicUrl);

  return publicUrl;
}
