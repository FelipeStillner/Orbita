import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useGeolocation } from "../../../hooks/useGeolocation";
import { fetchPlaces } from "../api/feedApi";

export function useFeedViewModel() {
  const { location, loading: locLoading, error: locError } = useGeolocation();

  // 1. React Query Setup
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["feed", location?.lat, location?.lng],
      queryFn: ({ pageParam = 1 }) => {
        if (!location) throw new Error("Location not ready");
        return fetchPlaces(location.lat, location.lng, pageParam);
      },
      getNextPageParam: (lastPage, allPages) => {
        const limit = 5;
        if (lastPage.features.length < limit) return undefined;
        return allPages.length + 1;
      },
      // Only fetch if we have location and no errors
      enabled: !!location && !locLoading && !locError,
      initialPageParam: 1,
    });

  // 2. Intersection Observer Logic
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  // 3. Data Transformation (Flatten Pages)
  const places = data?.pages.flatMap((page) => page.features) || [];

  // 4. Determine Current View State
  let viewState: "LOADING" | "ERROR" | "SUCCESS" = "LOADING";

  if (locError) {
    viewState = "ERROR";
  } else if (!locLoading && location && !isLoading) {
    viewState = "SUCCESS";
  }

  return {
    viewState,
    places,
    isFetchingNextPage,
    loadMoreRef,
  };
}
