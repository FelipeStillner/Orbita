import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import PlaceReel from "./components/PlaceReel";
import type { FeatureCollection } from "./types";
import { useGeolocation } from "../../hooks/useGeolocation";

// 1. Accept coordinates as arguments
const fetchPlaces = async (lat: number, lng: number) => {
  const { data } = await axios.get<FeatureCollection>(`/api/places`, {
    params: { lat, long: lng },
  });
  return data;
};

export default function FeedPage() {
  // 2. Get User Location
  const { location, loading: locLoading, error: locError } = useGeolocation();

  // Default to Lisbon (Orbita HQ) if permission denied or error
  const defaultLat = 38.722;
  const defaultLng = -9.139;

  const currentLat = location?.lat ?? defaultLat;
  const currentLng = location?.lng ?? defaultLng;

  // 3. Fetch Data (Only runs when we have a lat/lng decision)
  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ["feed", currentLat, currentLng], // Unique key per location
    queryFn: () => fetchPlaces(currentLat, currentLng),
    enabled: !locLoading, // Don't fetch until we know where we are
  });

  // 4. Loading State
  if (locLoading || dataLoading) {
    return (
      <div
        style={{
          height: "100vh",
          backgroundColor: "#000",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Finding the best spots around you...
      </div>
    );
  }

  // 5. Render
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

      {/* Show a small toast if we are using fallback data */}
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

      {data?.features.map((place) => (
        <PlaceReel key={place.properties.id} data={place.properties} />
      ))}

      {data?.features.length === 0 && (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          No places found nearby.
        </div>
      )}
    </div>
  );
}
