import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useGeolocation } from "@hooks/useGeolocation";
import { fetchListCategories } from "@api";
import type { PlaceListItem } from "@types";

export interface MapPlace {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

function toMapPlace(
  p: PlaceListItem & { latitude?: number; longitude?: number }
): MapPlace | null {
  if (
    typeof p.latitude !== "number" ||
    typeof p.longitude !== "number" ||
    !Number.isFinite(p.latitude) ||
    !Number.isFinite(p.longitude)
  ) {
    return null;
  }
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    latitude: p.latitude,
    longitude: p.longitude,
  };
}

export function useMapViewModel() {
  const { location, loading: locLoading, error: locError } = useGeolocation();

  const categoriesQuery = useQuery({
    queryKey: ["listCategories", location?.lat, location?.lng],
    queryFn: () => {
      if (!location) throw new Error("Location not ready");
      return fetchListCategories(location.lat, location.lng);
    },
    enabled: !!location && !locLoading && !locError,
  });

  const places = useMemo(() => {
    const categories = categoriesQuery.data?.categories ?? [];
    const all: MapPlace[] = [];
    for (const section of categories) {
      for (const p of section.places) {
        const place = toMapPlace(p);
        if (place) all.push(place);
      }
    }
    return all;
  }, [categoriesQuery.data?.categories]);

  const viewState: "LOADING" | "ERROR" | "SUCCESS" =
    locError ? "ERROR" : locLoading || (!!location && categoriesQuery.isLoading) ? "LOADING" : "SUCCESS";

  return {
    viewState,
    location,
    places,
    error: locError,
  };
}
