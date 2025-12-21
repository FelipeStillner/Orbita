import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import PlaceReel from "./components/PlaceReel";
import type { FeatureCollection } from "./types";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useEffect, useRef } from "react";

const fetchPlaces = async (lat: number, lng: number, page: number) => {
  const { data } = await axios.get<FeatureCollection>(`/api/places`, {
    params: { lat, long: lng, page, limit: 5 },
  });
  return data;
};

export default function FeedPage() {
  const { location, loading: locLoading, error: locError } = useGeolocation();

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

      enabled: !!location && !locLoading && !locError,

      initialPageParam: 1,
    });

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

  // --- ERROR STATE (Location Denied) ---
  if (locError) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "#000",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Location Required</h2>
        <p style={{ marginBottom: "20px", color: "#aaa", maxWidth: "300px" }}>
          We need your location to show you the best places nearby. Please
          enable location access in your browser settings.
        </p>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "underline",
            fontSize: "1rem",
          }}
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (locLoading || !location || isLoading) {
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

  // --- SUCCESS STATE ---
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

      {/* Render Feed */}
      {data?.pages.map((group, i) => (
        <div key={i}>
          {group.features.map((place) => (
            <PlaceReel key={place.properties.id} data={place.properties} />
          ))}
        </div>
      ))}

      {/* Infinite Scroll Trigger */}
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
