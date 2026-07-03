import { useEffect, useState } from "react";

import { getMediaToken } from "./media-token";

/**
 * Resolves a media capability token for the current session.
 * Returns `null` when the user is not authenticated.
 */
export function useOwnerMediaToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMediaToken().then((resolved) => {
      if (!cancelled) {
        setToken(resolved);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return token;
}
