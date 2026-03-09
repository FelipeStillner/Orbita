import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PlaceReel from "./PlaceReel";
import SaveToCollectionDrawer from "./SaveToCollectionDrawer";
import type { Place } from "../types";
import type { RefObject } from "react";
import { Text, Button } from "../../../components";
import { BackIcon } from "../../../assets/icons";

interface Props {
  places: Place[];
  loadMoreRef: RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  onOpenMap: (place: Place) => void;
  onInteraction: (
    place: Place,
    action: "like" | "hide"
  ) => void;
}

export default function FeedList({
  places,
  loadMoreRef,
  isFetchingNextPage,
  onOpenMap,
  onInteraction,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [saveDrawerPlace, setSaveDrawerPlace] = useState<Place | null>(null);

  useLayoutEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }

    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={listRef}
      className={`
        no-scrollbar
        h-dvh w-screen bg-black
        overflow-y-scroll overflow-x-hidden
        absolute top-0 left-0
        transition-opacity duration-500 transition-ease-out
        ${isReady ? "opacity-100" : "opacity-0"}
      `}
      style={{
        overflowAnchor: "none",
        scrollSnapType: isReady ? "y mandatory" : "none",
      }}
    >
      {/* Back button with glass effect */}
      <Link to="/" className="fixed top-8 left-8 z-50 animate-fade-slide-up">
        < Button
          // variant="glass-dark"
          size="md"
          className="shadow-2xl rounded-full w-14 h-14 flex items-center"
        >
          <BackIcon />
        </Button>
      </Link>

      {places.map((place, index) => (
        <PlaceReel
          key={place.id}
          data={place}
          onOpenMap={() => onOpenMap(place)}
          onInteraction={(action) => onInteraction(place, action)}
          onSaveClick={() => setSaveDrawerPlace(place)}
          index={index}
        />
      ))}

      <SaveToCollectionDrawer
        key={saveDrawerPlace?.id ?? "closed"}
        place={saveDrawerPlace}
        onClose={() => setSaveDrawerPlace(null)}
      />

      <div ref={loadMoreRef} className="h-20 w-full flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="glass-dark rounded-full px-6 py-3 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <Text variant="body-sm">Loading more...</Text>
          </div>
        )}
      </div>
    </div>
  );
}
