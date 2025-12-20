import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import PlaceReel from "./components/PlaceReel";
import type { FeatureCollection } from "./types";

// Fetch function
const fetchPlaces = async () => {
  // Using Lisbon coordinates (Orbita HQ) for testing.
  // Later we will swap this with the user's real geolocation.
  const lat = 38.722;
  const lng = -9.139;

  const { data } = await axios.get<FeatureCollection>(`/api/places`, {
    params: { lat, long: lng },
  });
  return data;
};

export default function FeedPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["feed"],
    queryFn: fetchPlaces,
  });

  if (isLoading)
    return (
      <div style={{ color: "white", padding: 20 }}>Finding nice spots...</div>
    );
  if (error)
    return (
      <div style={{ color: "white", padding: 20 }}>
        Error loading feed. Is the backend running?
      </div>
    );

  return (
    <div
      className="no-scrollbar" // <--- Add the class here too!
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#000",
        overflowY: "scroll",
        overflowX: "hidden", // Prevent horizontal scroll on the main page
        scrollSnapType: "y mandatory",
        position: "absolute", // Lock it to the viewport
        top: 0,
        left: 0,
      }}
    >
      {/* Back Button Overlay */}
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

      {/* Render the Reels */}
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
          No places found nearby. Try adding one!
        </div>
      )}
    </div>
  );
}
