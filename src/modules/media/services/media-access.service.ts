import path from "node:path";
import fs from "node:fs/promises";

import { getPropertyAccessRowRepository } from "@/modules/properties/repositories/property-read.repository";
import { canViewPropertyById } from "@/modules/properties/services/can-view-property";
import { isAdmin } from "@/utils/authorization";
import { parseStorageReference } from "@/lib/storage/storage-reference";
import { isPropertyMediaPubliclyVisible } from "../repositories/media-visibility.repository";
import {
  getCachedMediaAuth,
  setCachedMediaAuth,
} from "./media-auth-cache";

type MediaAccessInput = {
  storagePath: string;
  viewerUserId?: string;
  viewerRole?: string;
};

function extractPropertyId(storagePath: string): string | null {
  const match = storagePath.match(/^(?:images|videos)\/([^/]+)\//);

  return match?.[1] ?? null;
}

function extractAvatarUserId(storagePath: string): string | null {
  const match = storagePath.match(/^avatars\/([^/]+)\.webp$/);

  return match?.[1] ?? null;
}

async function canAccessPropertyMedia(input: {
  propertyId: string;
  viewerUserId?: string;
  viewerRole?: string;
}): Promise<boolean> {
  if (!input.viewerUserId && !input.viewerRole) {
    if (await isPropertyMediaPubliclyVisible(input.propertyId)) {
      return true;
    }
  }

  if (input.viewerRole && isAdmin(input.viewerRole)) {
    const property = await getPropertyAccessRowRepository(input.propertyId);
    return property != null;
  }

  return canViewPropertyById({
    propertyId: input.propertyId,
    viewerUserId: input.viewerUserId,
  });
}

export async function authorizeMediaAccess(
  input: MediaAccessInput,
): Promise<boolean> {
  const { storagePath, viewerUserId, viewerRole } = input;

  const cached = getCachedMediaAuth(storagePath, viewerUserId, viewerRole);

  if (cached !== undefined) {
    return cached;
  }

  let allowed = false;

  if (storagePath.startsWith("legacy/")) {
    allowed = await authorizeLegacyUploadAccess(
      storagePath,
      viewerUserId,
      viewerRole,
    );
  } else {
    const avatarUserId = extractAvatarUserId(storagePath);

    if (avatarUserId) {
      allowed = true;
    } else {
      const propertyId = extractPropertyId(storagePath);

      if (!propertyId) {
        allowed = false;
      } else {
        allowed = await canAccessPropertyMedia({
          propertyId,
          viewerUserId,
          viewerRole,
        });
      }
    }
  }

  setCachedMediaAuth(storagePath, allowed, viewerUserId, viewerRole);

  return allowed;
}

async function authorizeLegacyUploadAccess(
  storagePath: string,
  viewerUserId?: string,
  viewerRole?: string,
): Promise<boolean> {
  if (!viewerUserId && !viewerRole) {
    return false;
  }

  if (viewerRole && isAdmin(viewerRole)) {
    return true;
  }

  if (!viewerUserId) {
    return false;
  }

  const relativePath = storagePath.replace(/^legacy\//, "");

  if (relativePath.startsWith(`avatars/${viewerUserId}`)) {
    return true;
  }

  const propertyMatch = relativePath.match(
    /^(?:images|videos)\/([^/]+)\//,
  );

  if (!propertyMatch?.[1]) {
    return false;
  }

  return canAccessPropertyMedia({
    propertyId: propertyMatch[1],
    viewerUserId,
  });
}

export async function resolveAuthorizedStoragePath(
  reference: string,
): Promise<string | null> {
  return parseStorageReference(reference);
}

export async function readLegacyUploadFile(
  storagePath: string,
): Promise<Buffer | null> {
  if (!storagePath.startsWith("legacy/")) {
    return null;
  }

  const relativePath = storagePath.replace(/^legacy\//, "");
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const absolutePath = path.resolve(uploadsRoot, relativePath);

  if (!absolutePath.startsWith(uploadsRoot)) {
    return null;
  }

  try {
    return await fs.readFile(absolutePath);
  } catch {
    return null;
  }
}

export function legacyUploadContentType(storagePath: string): string {
  const lower = storagePath.toLowerCase();

  if (lower.endsWith(".webp")) {
    return "image/webp";
  }

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  if (lower.endsWith(".mp4")) {
    return "video/mp4";
  }

  if (lower.endsWith(".webm")) {
    return "video/webm";
  }

  return "application/octet-stream";
}
