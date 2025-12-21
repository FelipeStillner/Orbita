import { Link } from "react-router-dom";
import PlaceReel from "./PlaceReel";
import type { PlaceFeature } from "../types";
import type { RefObject } from "react";

interface Props {
  places: PlaceFeature[];
  loadMoreRef: RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
}

export default function FeedList({
  places,
  loadMoreRef,
  isFetchingNextPage,
}: Props) {
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

      {places.map((place) => (
        <PlaceReel key={place.properties.id} data={place.properties} />
      ))}

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
