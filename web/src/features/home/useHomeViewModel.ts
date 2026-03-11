import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { useGeolocation } from "@hooks/useGeolocation";
import { fetchPlaces } from "@api";
import type { PlaceListItem, PlacesResponse } from "@types";

const PLACES_PER_PAGE = 20;

function groupPlacesByCategory(places: PlaceListItem[]): { category: string; places: PlaceListItem[] }[] {
  const byCategory = new Map<string, PlaceListItem[]>();
  for (const place of places) {
    const cat = place.category || "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(place);
  }
  return Array.from(byCategory.entries()).map(([category, places]) => ({
    category,
    places,
  }));
}

export function useHomeViewModel() {
  const { location, loading: locLoading, error: locError } = useGeolocation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: placesLoading,
  } = useInfiniteQuery<PlacesResponse>({
    queryKey: ["feed", location?.lat, location?.lng],
    queryFn: ({ pageParam = 1 }) => {
      if (!location) throw new Error("Location not ready");
      return fetchPlaces(
        location.lat,
        location.lng,
        pageParam as number,
        PLACES_PER_PAGE
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.places.length < PLACES_PER_PAGE) return undefined;
      return allPages.length + 1;
    },
    enabled: !!location && !locLoading && !locError,
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const t = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  const places = data?.pages.flatMap((p: PlacesResponse) => p.places) ?? [];
  const categories = groupPlacesByCategory(places);

  let viewState: "LOADING" | "ERROR" | "SUCCESS" = "LOADING";
  if (locError) viewState = "ERROR";
  else if (locLoading || (!!location && placesLoading)) viewState = "LOADING";
  else viewState = "SUCCESS";

  return {
    viewState,
    categories,
    loadMoreRef,
    isFetchingNextPage,
    scrollRef,
    isReady,
  };
}
