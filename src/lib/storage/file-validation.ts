const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm", ".m4v"]);

const FORBIDDEN_MIME_PREFIXES = [
  "text/html",
  "image/svg+xml",
  "application/javascript",
  "text/javascript",
  "application/x-msdownload",
  "application/x-executable",
  "application/vnd.microsoft.portable-executable",
];

export const IMAGE_UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
export const VIDEO_UPLOAD_MAX_BYTES = 100 * 1024 * 1024;
export const AVATAR_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export class FileValidationError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "FileValidationError";
  }
}

function hasForbiddenMime(mimetype: string): boolean {
  const normalized = mimetype.toLowerCase().trim();

  return FORBIDDEN_MIME_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix),
  );
}

function assertMaxSize(size: number, maxBytes: number, label: string) {
  if (size > maxBytes) {
    throw new FileValidationError(
      `${label} exceeds maximum allowed size`,
      "FILE_TOO_LARGE",
    );
  }
}

export function validateImageUpload(input: {
  mimetype: string;
  size: number;
  filename?: string;
}) {
  assertMaxSize(input.size, IMAGE_UPLOAD_MAX_BYTES, "Image");

  const mimetype = input.mimetype.toLowerCase().trim();

  if (hasForbiddenMime(mimetype)) {
    throw new FileValidationError(
      "File type is not allowed",
      "INVALID_MIME_TYPE",
    );
  }

  if (!IMAGE_MIME_TYPES.has(mimetype)) {
    throw new FileValidationError(
      "Only JPEG, PNG, WebP, GIF, or HEIC images are allowed",
      "INVALID_MIME_TYPE",
    );
  }

  if (input.filename) {
    const extension = input.filename.toLowerCase();

    if (extension.endsWith(".svg")) {
      throw new FileValidationError(
        "SVG uploads are not allowed",
        "INVALID_EXTENSION",
      );
    }
  }
}

export function validateVideoUpload(input: {
  mimetype: string;
  size: number;
  filename: string;
}) {
  assertMaxSize(input.size, VIDEO_UPLOAD_MAX_BYTES, "Video");

  const mimetype = input.mimetype.toLowerCase().trim();

  if (hasForbiddenMime(mimetype)) {
    throw new FileValidationError(
      "File type is not allowed",
      "INVALID_MIME_TYPE",
    );
  }

  const extension = input.filename.toLowerCase().slice(
    input.filename.lastIndexOf("."),
  );

  if (!VIDEO_EXTENSIONS.has(extension)) {
    throw new FileValidationError(
      "Only mp4, mov, webm, or m4v videos are allowed",
      "INVALID_EXTENSION",
    );
  }

  if (!VIDEO_MIME_TYPES.has(mimetype)) {
    throw new FileValidationError(
      "Video MIME type is not allowed",
      "INVALID_MIME_TYPE",
    );
  }
}

export function validateAvatarUpload(input: {
  mimetype: string;
  size: number;
  filename?: string;
}) {
  assertMaxSize(input.size, AVATAR_UPLOAD_MAX_BYTES, "Avatar");
  validateImageUpload(input);
}
