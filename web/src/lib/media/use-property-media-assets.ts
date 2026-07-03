import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { findPropertyById } from "../../app/modules/publish/services/find-property-by-id";
import {
  buildMediaAssets,
  type MediaAsset,
  type RawMediaSource,
} from "./media-asset";
import { getMediaToken } from "./media-token";

type UsePropertyMediaAssetsResult = {
  media: MediaAsset[];
  mediaToken: string | null;
  isLoading: boolean;
  appendFromUpload: (source: RawMediaSource) => Promise<void>;
  setMedia: Dispatch<SetStateAction<MediaAsset[]>>;
};

/**
 * Loads property media with capability tokens and exposes helpers for uploads.
 * Single source of truth for publish/edit media state.
 */
export function usePropertyMediaAssets(
  propertyId: string | null | undefined,
): UsePropertyMediaAssetsResult {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [mediaToken, setMediaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!propertyId) {
        setMedia([]);
        setMediaToken(null);
        return;
      }

      setIsLoading(true);

      const token = await getMediaToken();

      if (cancelled) {
        return;
      }

      setMediaToken(token);

      try {
        const property = await findPropertyById(propertyId);

        if (cancelled) {
          return;
        }

        setMedia(buildMediaAssets(property, token));
      } catch (error) {
        console.error("Load property media failed", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const appendFromUpload = useCallback(
    async (source: RawMediaSource) => {
      const token = mediaToken ?? (await getMediaToken());

      if (token !== mediaToken) {
        setMediaToken(token);
      }

      setMedia((prev) => [...prev, ...buildMediaAssets(source, token)]);
    },
    [mediaToken],
  );

  return {
    media,
    mediaToken,
    isLoading,
    appendFromUpload,
    setMedia,
  };
}
