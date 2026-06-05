import { useCallback, useState } from "react";

import { useMapStore } from "../stores/useMapStore";
import { updateNotificationPreferences } from "../../notifications/services/notifications.service";

const CORDOBA_LOCATION = {
  lat: -31.4201,
  lng: -64.1888,
};

export function useUserGeolocation() {
  const setLastUserLocation =
    useMapStore((state) => state.setLastUserLocation);
  const lastUserLocation =
    useMapStore((state) => state.lastUserLocation);

  const [locating, setLocating] =
    useState(false);

  const locate = useCallback(
    async () => {
      if (!navigator.geolocation) {
        const fallback =
          lastUserLocation ?? CORDOBA_LOCATION;

        return fallback;
      }

      setLocating(true);

      try {
        const position =
          await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy:
                    true,
                  timeout:
                    7000,
                  maximumAge:
                    1000 * 60 * 5,
                }
              );
            }
          );

        const location = {
          lat:
            position.coords.latitude,
          lng:
            position.coords.longitude,
        };

        setLastUserLocation(location);

        if (localStorage.getItem("accessToken")) {
          void updateNotificationPreferences({
            latitude: location.lat,
            longitude: location.lng,
          }).catch(() => undefined);
        }

        return location;
      } catch {
        const fallback =
          lastUserLocation ?? CORDOBA_LOCATION;

        return fallback;
      } finally {
        setLocating(false);
      }
    },
    [
      lastUserLocation,
      setLastUserLocation,
    ],
  );

  return {
    locate,
    locating,
  };
}
