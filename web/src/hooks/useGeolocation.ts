import { useState, useEffect } from "react";

interface Location {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  // FIX: Check support immediately during initialization.
  // This prevents the "setState inside useEffect" warning and saves a render.
  const [error, setError] = useState<string | null>(() => {
    if (!navigator.geolocation) {
      return "Geolocation is not supported by your browser";
    }
    return null;
  });

  const [location, setLocation] = useState<Location | null>(null);

  // If there is an error initially (no support), we are not loading.
  const [loading, setLoading] = useState<boolean>(
    () => !!navigator.geolocation,
  );

  useEffect(() => {
    // If we already know it's not supported, stop here.
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
