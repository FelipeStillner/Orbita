import { useState, useEffect } from "react";
import type { Place } from "../types";
import { Button, Badge, Text } from "@components";
import { LikeIcon, LikedIcon, HideIcon, SaveIcon, SavedIcon, MapIcon } from "@assets/icons";

interface Props {
  data: Place;
  onOpenMap: () => void;
  index?: number;
  onInteraction?: (action: "like" | "hide") => void;
  onSaveClick?: () => void;
}

export default function PlaceReel({
  data,
  onOpenMap,
  index = 0,
  onInteraction,
  onSaveClick,
}: Props) {
  const isSaved = (data.collections?.length ?? 0) > 0;
  const [isLiked, setIsLiked] = useState(data.liked);
  useEffect(() => {
    setIsLiked(data.liked);
  }, [data.liked]);

  const images =
    data.images && data.images.length > 0
      ? data.images
      : [
        {
          url: "https://placehold.co/600x800/1a1a1a/FFF?text=No+Image",
          description: "Placeholder",
          is_primary: true,
        },
      ];

  return (
    <div
      className="h-dvh w-screen relative bg-black overflow-hidden"
      style={{
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
      }}
    >
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
              <div className="absolute top-8 right-8 animate-fade-slide-up" style={{ animationDelay: `${0.1 + imgIndex * 0.05}s` }}>
                <Badge>
                  {imgIndex + 1} / {images.length}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Map & Interaction Buttons */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-3 animate-fade-slide-up"
        style={{ animationDelay: `${0.3 + index * 0.05}s` }}
      >
        <div className="flex flex-col gap-2 items-end">
          {onInteraction && (
            <>
              <Button
                size="sm"
                variant="default"
                className="flex items-center justify-center rounded-full w-14 h-14 shadow-2xl text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                  onInteraction("like");
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
                  onSaveClick?.();
                }}
              >
                {isSaved ? <SavedIcon /> : <SaveIcon />}
              </Button>
              <Button
                size="sm"
                variant="default"
                className="flex items-center justify-center rounded-full w-14 h-14 shadow-2xl text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onInteraction("hide");
                }}
              >
                <HideIcon />
              </Button>
            </>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-8 pr-28 pb-12 animate-fade-slide-up"
        style={{ animationDelay: `${0.2 + index * 0.05}s` }}
      >
        <div className="absolute inset-0 rounded-t-[3rem]" />
        <div className="relative z-10 space-y-4">
          <div className="space-y-2">
            <Text variant="h2" className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-2xl">
              {data.name}
            </Text>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMap();
                }}
              >
                <MapIcon />
              </Button>
              <Badge>{data.category}</Badge>
            </div>

          </div>
          <Text variant="body" className="leading-relaxed text-white/90 drop-shadow-lg max-w-2xl">
            {data.description}
          </Text>
        </div>
      </div>

      {/* Top gradient for depth */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
    </div >
  );
}