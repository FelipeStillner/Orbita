import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { PlaceListItem } from "@types";
import { Text, LazyCoverImage } from "@components";
import { getHomeCardImageUrl } from "@helpers/imageUrls";
import { formatDistanceMeters } from "@helpers/formatDistance";
import { formatPlaceTagLabel } from "@helpers/formatPlaceTag";
import { ImageIcon } from "@assets/icons";

interface Props {
  place: PlaceListItem;
}

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x300/1a1a1a/FFF?text=No+Image";

/** Readable on bright images: dark frosted chip (matches tags + corner meta). */
const chipClassName =
  "rounded-md border border-white/15 bg-black/60 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-white/95 backdrop-blur-sm";

export default function PlaceCard({ place }: Props) {
  const rawImageUrl =
    place.images?.[0]?.url ??
    place.images?.find((i) => i.is_primary)?.url ??
    PLACEHOLDER_IMAGE;
  const imageUrl = getHomeCardImageUrl(rawImageUrl);
  const photoCount =
    typeof place.photo_count === "number"
      ? place.photo_count
      : place.images?.length ?? 0;
  const likeCount = place.like_count ?? 0;
  const tags = place.tags?.filter(Boolean) ?? [];
  const showMetaRow =
    place.is_open_now === true ||
    place.is_open_now === false ||
    likeCount > 0;

  const metaParts: { key: string; node: ReactNode }[] = [];
  if (place.is_open_now === true) {
    metaParts.push({
      key: "open",
      node: <span className="text-emerald-300">Open</span>,
    });
  } else if (place.is_open_now === false) {
    metaParts.push({
      key: "closed",
      node: <span className="text-rose-300/95">Closed</span>,
    });
  }
  if (likeCount > 0) {
    metaParts.push({
      key: "likes",
      node: <span>{likeCount} likes</span>,
    });
  }

  return (
    <Link
      to={`/?place=${place.id}`}
      className="flex-shrink-0 w-[160px] sm:w-[200px] group block rounded-2xl overflow-hidden glass-medium border border-white/10 hover:glass-strong hover:border-white/20 transition-all duration-300"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 origin-center transition-transform duration-300 ease-out group-hover:scale-105">
            <LazyCoverImage src={imageUrl} alt="" className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        </div>
        {typeof place.distance_meters === "number" && (
          <div className={`absolute top-3 left-3 z-10 tabular-nums ${chipClassName}`}>
            {formatDistanceMeters(place.distance_meters)}
          </div>
        )}
        {photoCount > 0 && (
          <div
            className={`absolute top-3 right-3 z-10 flex items-center gap-1 ${chipClassName}`}
            aria-label={`${photoCount} images`}
          >
            <span className="tabular-nums leading-none">{photoCount}</span>
            <ImageIcon className="h-3 w-3 shrink-0" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
          {showMetaRow && metaParts.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] leading-tight text-white/90 font-medium tracking-tight">
              {metaParts.map((part, i) => (
                <Fragment key={part.key}>
                  {i > 0 && <span className="text-white/35">·</span>}
                  {part.node}
                </Fragment>
              ))}
            </div>
          )}
          <Text variant="body-sm" className="font-medium line-clamp-2 text-white drop-shadow-lg">
            {place.name}
          </Text>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className={`inline-block max-w-[140px] truncate ${chipClassName}`}
                >
                  {formatPlaceTagLabel(tag)}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-[9px] font-medium text-white/55">+{tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
