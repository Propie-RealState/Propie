import { describe, expect, it } from "vitest";

import {
  FileValidationError,
  validateAvatarUpload,
  validateImageUpload,
  validateVideoUpload,
  IMAGE_UPLOAD_MAX_BYTES,
} from "@/lib/storage/file-validation";
import {
  parseStorageReference,
  toMediaAccessPath,
} from "@/lib/storage/storage-reference";

describe("file validation", () => {
  it("rejects SVG uploads", () => {
    expect(() =>
      validateImageUpload({
        mimetype: "image/png",
        size: 1024,
        filename: "photo.svg",
      }),
    ).toThrow(FileValidationError);
  });

  it("rejects HTML mime types", () => {
    expect(() =>
      validateAvatarUpload({
        mimetype: "text/html",
        size: 1024,
        filename: "avatar.jpg",
      }),
    ).toThrow(FileValidationError);
  });

  it("rejects oversized images", () => {
    expect(() =>
      validateImageUpload({
        mimetype: "image/jpeg",
        size: IMAGE_UPLOAD_MAX_BYTES + 1,
      }),
    ).toThrow(FileValidationError);
  });

  it("accepts allowed video types", () => {
    expect(() =>
      validateVideoUpload({
        mimetype: "video/mp4",
        size: 1024,
        filename: "clip.mp4",
      }),
    ).not.toThrow();
  });
});

describe("storage reference", () => {
  it("parses bucket-relative storage paths", () => {
    expect(parseStorageReference("images/prop-id/file.webp")).toBe(
      "images/prop-id/file.webp",
    );
  });

  it("parses legacy public supabase URLs", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/public/property-images/images/p1/a.webp";

    expect(parseStorageReference(url)).toBe("images/p1/a.webp");
  });

  it("maps storage paths to authorized media routes", () => {
    expect(toMediaAccessPath("avatars/user-id.webp")).toBe(
      "/media/avatars/user-id.webp",
    );
  });
});
