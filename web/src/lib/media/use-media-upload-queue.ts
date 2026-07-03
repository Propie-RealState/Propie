import { useCallback, useEffect, useRef, useState } from "react";

import type { RawMediaSource } from "./media-asset";
import { formatUploadError } from "./upload-errors";

export type PendingUpload = {
  localId: string;
  type: "image" | "video";
  previewUrl: string;
  file: File;
  status: "uploading" | "error";
  errorMessage?: string;
};

type UseMediaUploadQueueOptions = {
  propertyId: string | null | undefined;
  onUploaded: (source: RawMediaSource) => Promise<void>;
  uploadImages: (
    propertyId: string,
    files: File[],
  ) => Promise<{ images: RawMediaSource["images"] }>;
  uploadVideos: (
    propertyId: string,
    files: File[],
  ) => Promise<{ videos: RawMediaSource["videos"] }>;
};

export function useMediaUploadQueue({
  propertyId,
  onUploaded,
  uploadImages,
  uploadVideos,
}: UseMediaUploadQueueOptions) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = blobUrlsRef.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const revokePreview = useCallback((previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    blobUrlsRef.current.delete(previewUrl);
  }, []);

  const removePending = useCallback(
    (localIds: string[]) => {
      setPending((current) => {
        const idSet = new Set(localIds);

        current.forEach((item) => {
          if (idSet.has(item.localId)) {
            revokePreview(item.previewUrl);
          }
        });

        return current.filter((item) => !idSet.has(item.localId));
      });
    },
    [revokePreview],
  );

  const runUpload = useCallback(
    async (
      batch: PendingUpload[],
      type: "image" | "video",
    ) => {
      if (!propertyId) {
        return;
      }

      const files = batch.map((item) => item.file);

      try {
        const result =
          type === "image"
            ? await uploadImages(propertyId, files)
            : await uploadVideos(propertyId, files);

        await onUploaded(
          type === "image"
            ? { images: result.images }
            : { videos: result.videos },
        );

        removePending(batch.map((item) => item.localId));
      } catch (error) {
        const message = formatUploadError(error);

        setPending((current) =>
          current.map((item) =>
            batch.some((entry) => entry.localId === item.localId)
              ? { ...item, status: "error", errorMessage: message }
              : item,
          ),
        );
      }
    },
    [propertyId, onUploaded, removePending, uploadImages, uploadVideos],
  );

  const enqueueFiles = useCallback(
    (files: File[], type: "image" | "video") => {
      if (!propertyId || files.length === 0) {
        return;
      }

      const batch: PendingUpload[] = files.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        blobUrlsRef.current.add(previewUrl);

        return {
          localId: crypto.randomUUID(),
          type,
          previewUrl,
          file,
          status: "uploading",
        };
      });

      setPending((current) => [...current, ...batch]);
      void runUpload(batch, type);
    },
    [propertyId, runUpload],
  );

  const retryUpload = useCallback(
    (localId: string) => {
      const item = pending.find((entry) => entry.localId === localId);

      if (!item) {
        return;
      }

      setPending((current) =>
        current.map((entry) =>
          entry.localId === localId
            ? { ...entry, status: "uploading", errorMessage: undefined }
            : entry,
        ),
      );

      void runUpload([item], item.type);
    },
    [pending, runUpload],
  );

  const dismissFailed = useCallback(
    (localId: string) => {
      removePending([localId]);
    },
    [removePending],
  );

  const isUploading = pending.some((item) => item.status === "uploading");

  return {
    pending,
    isUploading,
    enqueueFiles,
    retryUpload,
    dismissFailed,
  };
}
