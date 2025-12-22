import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PlaceReel from "./PlaceReel";
import type { PlaceFeature } from "../types";
import type { RefObject } from "react";

interface Props {
  places: PlaceFeature[];
  loadMoreRef: RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  onOpenMap: (place: PlaceFeature) => void;
}

export default function FeedList({
  places,
  loadMoreRef,
  isFetchingNextPage,
  onOpenMap,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  const [isSnapEnabled, setIsSnapEnabled] = useState(false);

  useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }

    const timer = setTimeout(() => {
      setIsSnapEnabled(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={listRef}
      className="no-scrollbar"
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#000",
        overflowY: "scroll",
        overflowX: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
        scrollSnapType: isSnapEnabled ? "y mandatory" : "none",
        scrollBehavior: isSnapEnabled ? "smooth" : "auto",
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
        <PlaceReel
          key={place.properties.id}
          data={place.properties}
          onOpenMap={() => onOpenMap(place)}
        />
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
