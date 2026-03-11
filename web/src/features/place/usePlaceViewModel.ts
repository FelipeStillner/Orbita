import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useGeolocation } from "@hooks/useGeolocation";
import { fetchPlaces } from "@api";
import { sendInteraction } from "./api";
import type { Place, PlacesResponse } from "@types";

export function usePlaceViewModel() {
  const { location, loading: locLoading, error: locError } = useGeolocation();

  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: placesLoading } =
    useInfiniteQuery<PlacesResponse>({
      queryKey: ["feed", location?.lat, location?.lng],
      queryFn: ({ pageParam = 1 }) => {
        if (!location) throw new Error("Location not ready");
        return fetchPlaces(location.lat, location.lng, pageParam);
      },
      getNextPageParam: (lastPage, allPages) => {
        const limit = 5;
        if (lastPage.places.length < limit) return undefined;
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
    data?.pages.flatMap((page: PlacesResponse) => page.places) || [];

  const handleOpenMap = (place: Place) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    window.open(url, "_blank");
  };

  const handleInteraction = async (
    place: Place,
    action: "like" | "hide"
  ) => {
    const id = place.id;

    switch (action) {
      case "like":
        await sendInteraction(id, { liked: !place.liked, hidden: false });
        break;
      case "hide":
        queryClient.setQueryData(
          ["feed", location?.lat, location?.lng],
          (oldData: { pages: PlacesResponse[]; pageParams: unknown[] } | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                places: page.places.filter(
                  (p: Place) => p.id !== id
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
  } else if (locLoading || (!!location && placesLoading)) {
    viewState = "LOADING";
  } else {
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