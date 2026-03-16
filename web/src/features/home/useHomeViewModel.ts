import { useQuery, useQueries, useMutation } from "@tanstack/react-query";
import { useRef, useLayoutEffect, useState, useMemo } from "react";
import { useGeolocation } from "@hooks/useGeolocation";
import { fetchListCategories, fetchListPlaces, fetchSearchPlaces } from "@api";
import type { PlaceListItem } from "@types";

export function useHomeViewModel() {
  const { location, loading: locLoading, error: locError } = useGeolocation();

  const homeQuery = useQuery({
    queryKey: ["listCategories", location?.lat, location?.lng],
    queryFn: () => {
      if (!location) throw new Error("Location not ready");
      return fetchListCategories(location.lat, location.lng);
    },
    enabled: !!location && !locLoading && !locError,
  });

  const homeCategories = homeQuery.data?.categories ?? [];
  const categoryKeys = useMemo(
    () => homeCategories.map((c) => c.category),
    [homeCategories]
  );

  const categoryQueries = useQueries({
    queries: categoryKeys.map((category) => ({
      queryKey: ["listPlaces", location?.lat, location?.lng, category],
      queryFn: () => {
        if (!location) throw new Error("Location not ready");
        return fetchListPlaces(location.lat, location.lng, category);
      },
      enabled: !!location && !!category,
    })),
  });

  const searchPlacesMutation = useMutation({
    mutationFn: async () => {
      if (!location) throw new Error("Location not ready");
      return fetchSearchPlaces(location.lat, location.lng);
    },
    onSuccess: (data) => {
      console.log("Search places response", data);
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const t = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  const categories: { category: string; places: PlaceListItem[] }[] = useMemo(() => {
    return homeCategories.map((section, i) => {
      const fullData = categoryQueries[i]?.data;
      const places =
        fullData?.places && fullData.places.length > 0
          ? fullData.places
          : section.places;
      return { category: section.category, places };
    });
  }, [homeCategories, categoryQueries]);

  let viewState: "LOADING" | "ERROR" | "SUCCESS" = "LOADING";
  if (locError) viewState = "ERROR";
  else if (locLoading || (!!location && homeQuery.isLoading)) viewState = "LOADING";
  else viewState = "SUCCESS";

  return {
    viewState,
    categories,
    scrollRef,
    isReady,
    searchNearby: () => searchPlacesMutation.mutate(),
    searchLoading: searchPlacesMutation.isPending,
  };
}
