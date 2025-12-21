import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import PlaceReel from "./components/PlaceReel";
import type { FeatureCollection } from "./types";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useEffect, useRef } from "react";

// 1. Update fetcher to accept pageParam (defaulting to 1)
const fetchPlaces = async (lat: number, lng: number, page: number) => {
  const { data } = await axios.get<FeatureCollection>(`/api/places`, {
    params: { lat, long: lng, page, limit: 5 }, // Fetch 5 items per "page"
  });
  return data;
};

export default function FeedPage() {
  const { location, loading: locLoading, error: locError } = useGeolocation();

  // Default to Lisbon (Orbita HQ)
  const defaultLat = 38.722;
  const defaultLng = -9.139;

  const currentLat = location?.lat ?? defaultLat;
  const currentLng = location?.lng ?? defaultLng;

  // 2. Use Infinite Query
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["feed", currentLat, currentLng],
      queryFn: ({ pageParam = 1 }) =>
        fetchPlaces(currentLat, currentLng, pageParam),
      getNextPageParam: (lastPage, allPages) => {
        // Logic: If the API returns fewer items than the limit (5), we are at the end.
        // Otherwise, assume there is a next page.
        const limit = 5;
        if (lastPage.features.length < limit) return undefined;
        return allPages.length + 1;
      },
      enabled: !locLoading,
      initialPageParam: 1,
    });

  // 3. Infinite Scroll Trigger (Intersection Observer)
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // If the "loadMore" div is visible AND we have more pages, fetch!
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  if (locLoading || isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          backgroundColor: "#000",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Finding the best spots...
      </div>
    );
  }

  return (
    <div
      className="no-scrollbar"
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#000",
        overflowY: "scroll",
        overflowX: "hidden",
        scrollSnapType: "y mandatory",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <Link
        to="/"
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 100,
          color: "white",
          textDecoration: "none",
          fontSize: "1.5rem",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        ←
      </Link>

      {locError && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 100,
            background: "rgba(255, 100, 100, 0.8)",
            padding: "5px 10px",
            borderRadius: "8px",
            color: "white",
            fontSize: "0.8rem",
          }}
        >
          Location denied. Showing Lisbon.
        </div>
      )}

      {/* 4. Flatten the pages array to render all loaded items */}
      {data?.pages.map((group, i) => (
        <div key={i}>
          {group.features.map((place) => (
            <PlaceReel key={place.properties.id} data={place.properties} />
          ))}
        </div>
      ))}

      {/* 5. Invisible element at the bottom to trigger the next fetch */}
      <div
        ref={loadMoreRef}
        style={{
          height: "50px",
          scrollSnapAlign: "start",
          color: "gray",
          textAlign: "center",
          paddingTop: "20px",
        }}
      >
        {isFetchingNextPage ? "Loading more..." : ""}
      </div>
    </div>
  );
}
