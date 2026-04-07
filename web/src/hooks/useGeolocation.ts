import { useState, useEffect } from "react";

interface Location {
  lat: number;
  lng: number;
}

export type UseGeolocationOptions = {
  /** When true, updates position as you move (cleared on unmount). */
  watch?: boolean;
};

export function useGeolocation(options?: UseGeolocationOptions) {
  const watch = options?.watch ?? false;

  const [error, setError] = useState<string | null>(() => {
    if (!navigator.geolocation) {
      return "Geolocation is not supported by your browser";
    }
    return null;
  });

  const [location, setLocation] = useState<Location | null>(null);

  const [loading, setLoading] = useState<boolean>(
    () => !!navigator.geolocation,
  );

  useEffect(() => {
    if (!navigator.geolocation) return;

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLoading(false);
    };

    const onError = (err: GeolocationPositionError) => {
      setError(err.message);
      setLoading(false);
    };

    if (watch) {
      const id = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 10000,
      });
      return () => navigator.geolocation.clearWatch(id);
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, [watch]);

  return { location, error, loading };
}
