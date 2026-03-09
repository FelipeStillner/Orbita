import { useState, useEffect } from "react";

interface Location {
  lat: number;
  lng: number;
}

export function useGeolocation() {
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, []);

  return { location, error, loading };
}
