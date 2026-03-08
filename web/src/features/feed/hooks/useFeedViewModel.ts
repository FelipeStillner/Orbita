import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useGeolocation } from "../../../hooks/useGeolocation";
import { fetchPlaces, sendInteraction } from "../api";
import type { FeatureCollection, PlaceFeature } from "../types";

export function useFeedViewModel() {
  const { location, loading: locLoading, error: locError } = useGeolocation();

  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<FeatureCollection>({
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
      enabled: !!location && !locLoading && !locError,
    });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  const places =
    data?.pages.flatMap((page: FeatureCollection) => page.features) || [];

  const handleOpenMap = (place: PlaceFeature) => {
    const [lng, lat] = place.geometry.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const handleInteraction = async (
    place: PlaceFeature,
    action: "like" | "hide"
  ) => {
    const id = place.properties.id;

    switch (action) {
      case "like":
        await sendInteraction(id, { liked: !place.properties.liked, hidden: false });
        break;
      case "hide":
        queryClient.setQueryData(
          ["feed", location?.lat, location?.lng],
          (oldData: { pages: FeatureCollection[]; pageParams: unknown[] } | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                features: page.features.filter(
                  (p: PlaceFeature) => p.properties.id !== id
                ),
              })),
            };
          }
        );

        // Fire the API request in the background
        await sendInteraction(id, { hidden: true, liked: false });
        break;
    }
  };

  let viewState: "LOADING" | "ERROR" | "SUCCESS" = "LOADING";

  if (locError) {
    viewState = "ERROR";
  } else if (!locLoading && location) {
    viewState = "SUCCESS";
  }

  return {
    viewState,
    places,
    loadMoreRef,
    isFetchingNextPage,
    handleOpenMap,
    handleInteraction,
  };
}