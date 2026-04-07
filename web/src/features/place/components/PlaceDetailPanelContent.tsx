import { useState, useEffect } from "react";
import type { Place } from "@types";
import { Button, Badge, Text } from "@components";
import { LikeIcon, LikedIcon, SaveIcon, SavedIcon, MapIcon } from "@assets/icons";
import { getCategoryLabel } from "@helpers/formatCategoryLabel";
import { formatDistanceMeters } from "@helpers/formatDistance";
import { formatPlaceTagLabel } from "@helpers/formatPlaceTag";

interface Props {
  place: Place;
  onLike: () => void;
  onSaveClick: () => void;
  onOpenMap: () => void;
  likeDisabled?: boolean;
  saveDisabled?: boolean;
}

const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x400/1a1a1a/FFF?text=No+Image";

export default function PlaceDetailPanelContent({
  place,
  onLike,
  onSaveClick,
  onOpenMap,
  likeDisabled = false,
  saveDisabled = false,
}: Props) {
  const isSaved = (place.guides?.length ?? 0) > 0;
  const [isLiked, setIsLiked] = useState(place.liked);

  useEffect(() => {
    setIsLiked(place.liked);
  }, [place.liked]);

  const images =
    place.images && place.images.length > 0
      ? place.images
      : [{ url: PLACEHOLDER_IMAGE, description: "Placeholder", is_primary: true }];
  const primaryImage = images.find((i) => i.is_primary) ?? images[0];

  return (
    <div
      className="flex flex-col h-full overflow-hidden bg-black"
      style={{ borderTopLeftRadius: "1.5rem", borderTopRightRadius: "1.5rem" }}
    >
      {/* Image - fixed aspect ratio at top */}
      <div className="relative w-full aspect-[4/3] flex-shrink-0 bg-black overflow-hidden rounded-tl-[1.5rem] rounded-tr-[1.5rem]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${primaryImage.url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        {images.length > 1 && (
          <div className="absolute top-3 right-3">
            <Badge>{images.length} photos</Badge>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
        <div className="space-y-3">
          <Text variant="h2" className="text-2xl font-bold leading-tight text-white">
            {place.name}
          </Text>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge>{getCategoryLabel(place.category)}</Badge>
            {place.is_open_now === true && (
              <Badge>
                <span className="text-emerald-300">Open</span>
              </Badge>
            )}
            {place.is_open_now === false && (
              <Badge>
                <span className="text-rose-300/95">Closed</span>
              </Badge>
            )}
            {typeof place.distance_meters === "number" && (
              <Text variant="body-sm" muted className="text-white/70">
                {formatDistanceMeters(place.distance_meters)} away
              </Text>
            )}
            {typeof place.like_count === "number" && place.like_count > 0 && (
              <Text variant="body-sm" muted className="text-white/70">
                {place.like_count} likes
              </Text>
            )}
            {place.opening_hours && (
              <Text variant="body-sm" muted className="text-white/70">
                {place.opening_hours}
              </Text>
            )}
          </div>
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/85"
                >
                  {formatPlaceTagLabel(tag)}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="md"
              variant="default"
              disabled={likeDisabled}
              onClick={(e) => {
                e.stopPropagation();
                if (likeDisabled) return;
                setIsLiked(!isLiked);
                onLike();
              }}
            >
              {isLiked ? <LikedIcon /> : <LikeIcon />}
            </Button>
            <Button
              size="md"
              variant="default"
              disabled={saveDisabled}
              onClick={() => {
                if (saveDisabled) return;
                onSaveClick();
              }}
            >
              {isSaved ? <SavedIcon /> : <SaveIcon />}
            </Button>
            <Button size="md" variant="default" onClick={onOpenMap}>
              <MapIcon />
            </Button>
          </div>
        </div>
        <Text variant="body" className="leading-relaxed text-white/90">
          {place.description}
        </Text>
      </div>
    </div>
  );
}
