import path from "node:path";
import fs from "node:fs/promises";

import { getPropertyByIdRepository } from "@/modules/properties/repositories/property-read.repository";
import { findPropertyByIdService } from "@/modules/properties/services/find-property-by-id.service";
import { isAdmin } from "@/utils/authorization";
import { parseStorageReference } from "@/lib/storage/storage-reference";

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
  if (input.viewerRole && isAdmin(input.viewerRole)) {
    const property = await getPropertyByIdRepository(input.propertyId);
    return property != null;
  }

  const property = await findPropertyByIdService({
    propertyId: input.propertyId,
    viewerUserId: input.viewerUserId,
  });

  return property != null;
}

export async function authorizeMediaAccess(
  input: MediaAccessInput,
): Promise<boolean> {
  const { storagePath } = input;

  if (storagePath.startsWith("legacy/")) {
    return authorizeLegacyUploadAccess(
      storagePath,
      input.viewerUserId,
      input.viewerRole,
    );
  }

  const avatarUserId = extractAvatarUserId(storagePath);

  if (avatarUserId) {
    return true;
  }

  const propertyId = extractPropertyId(storagePath);

  if (!propertyId) {
    return false;
  }

  return canAccessPropertyMedia({
    propertyId,
    viewerUserId: input.viewerUserId,
    viewerRole: input.viewerRole,
  });
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
