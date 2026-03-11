import { useState, useEffect } from "react";
import type { Place } from "@types";
import { Button, Badge, Text } from "@components";
import { LikeIcon, LikedIcon, SaveIcon, SavedIcon, MapIcon } from "@assets/icons";

interface Props {
  place: Place;
  onBack: () => void;
  onLike: () => void;
  onSaveClick: () => void;
  onOpenMap: () => void;
}

export default function PlaceDetailView({
  place,
  onBack,
  onLike,
  onSaveClick,
  onOpenMap,
}: Props) {
  const isSaved = (place.collections?.length ?? 0) > 0;
  const [isLiked, setIsLiked] = useState(place.liked);

  useEffect(() => {
    setIsLiked(place.liked);
  }, [place.liked]);

  const images =
    place.images && place.images.length > 0
      ? place.images
      : [
        {
          url: "https://placehold.co/600x800/1a1a1a/FFF?text=No+Image",
          description: "Placeholder",
          is_primary: true,
        },
      ];

  return (
    <div className="h-dvh w-screen relative bg-black overflow-hidden">
      {/* Horizontal Image Carousel */}
      <div className="no-scrollbar flex overflow-x-auto overflow-y-hidden h-full w-full snap-x snap-mandatory">
        {images.map((img, imgIndex) => (
          <div
            key={imgIndex}
            className="min-w-[100vw] h-full bg-cover bg-center snap-start relative transition-all duration-500"
            style={{ backgroundImage: `url(${img.url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
            {images.length > 1 && (
              <div
                className="absolute top-8 right-8 animate-fade-slide-up"
                style={{ animationDelay: `${0.1 + imgIndex * 0.05}s` }}
              >
                <Badge>
                  {imgIndex + 1} / {images.length}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Return button - top left */}
      <div className="absolute top-8 left-8 z-50 animate-fade-slide-up">
        <Button
          size="md"
          className="shadow-2xl rounded-full w-14 h-14 flex items-center justify-center"
          onClick={onBack}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Button>
      </div>

      {/* Like & Save - right side */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-3 animate-fade-slide-up">
        <Button
          size="sm"
          variant="default"
          className="flex items-center justify-center rounded-full w-14 h-14 shadow-2xl text-white"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
            onLike();
          }}
        >
          {isLiked ? <LikedIcon /> : <LikeIcon />}
        </Button>
        <Button
          size="sm"
          variant="default"
          className="flex items-center justify-center rounded-full w-14 h-14 shadow-2xl text-white"
          onClick={(e) => {
            e.stopPropagation();
            onSaveClick();
          }}
        >
          {isSaved ? <SavedIcon /> : <SaveIcon />}
        </Button>
      </div>

      {/* Info at bottom - extra padding so content sits above the bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-8 pr-28 animate-fade-slide-up" style={{ paddingBottom: "max(6rem, calc(72px + 1.5rem))" }}>
        <div className="relative z-10 space-y-4">
          <div className="space-y-2">
            <Text
              variant="h2"
              className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-2xl"
            >
              {place.name}
            </Text>
            <div className="flex items-center gap-3 flex-wrap">
              <Button size="sm" variant="default" onClick={onOpenMap}>
                <MapIcon />
              </Button>
              <Badge>{place.category}</Badge>
            </div>
            {place.opening_hours && (
              <Text variant="body-sm" muted className="block mt-1">
                Hours: {place.opening_hours}
              </Text>
            )}
          </div>
          <Text
            variant="body"
            className="leading-relaxed text-white/90 drop-shadow-lg max-w-2xl"
          >
            {place.description}
          </Text>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
    </div>
  );
}
