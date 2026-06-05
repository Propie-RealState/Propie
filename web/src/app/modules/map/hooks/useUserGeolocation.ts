import { useCallback, useState } from "react";

import {
  getCurrentCoordinates,
  persistNotificationLocation,
} from "../../../../lib/location-preferences";
import { useMapStore } from "../stores/useMapStore";

const CORDOBA_LOCATION = {
  lat: -31.4201,
  lng: -64.1888,
};

export function useUserGeolocation() {
  const setLastUserLocation =
    useMapStore((state) => state.setLastUserLocation);
  const lastUserLocation =
    useMapStore((state) => state.lastUserLocation);

  const [locating, setLocating] = useState(false);

  const locate = useCallback(async () => {
    if (!navigator.geolocation) {
      return lastUserLocation ?? CORDOBA_LOCATION;
    }

    setLocating(true);

    try {
      const location = await getCurrentCoordinates({
        maximumAge: 1000 * 60 * 5,
      });

      setLastUserLocation(location);
      void persistNotificationLocation(location).catch(() => undefined);

      return location;
    } catch {
      return lastUserLocation ?? CORDOBA_LOCATION;
    } finally {
      setLocating(false);
    }
  }, [lastUserLocation, setLastUserLocation]);

  return {
    locate,
    locating,
  };
}
