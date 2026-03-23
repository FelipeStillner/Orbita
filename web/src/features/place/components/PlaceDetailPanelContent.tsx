import { useState, useEffect } from "react";
import type { Place } from "@types";
import { Button, Badge, Text } from "@components";
import { LikeIcon, LikedIcon, SaveIcon, SavedIcon, MapIcon } from "@assets/icons";
import { getCategoryLabel } from "@helpers/formatCategoryLabel";

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
  const isSaved = (place.collections?.length ?? 0) > 0;
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
            {place.opening_hours && (
              <Text variant="body-sm" muted className="text-white/70">
                {place.opening_hours}
              </Text>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              className="rounded-full w-12 h-12 flex items-center justify-center"
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
              size="sm"
              variant="default"
              className="rounded-full w-12 h-12 flex items-center justify-center"
              disabled={saveDisabled}
              onClick={() => {
                if (saveDisabled) return;
                onSaveClick();
              }}
            >
              {isSaved ? <SavedIcon /> : <SaveIcon />}
            </Button>
            <Button size="sm" variant="default" onClick={onOpenMap}>
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
