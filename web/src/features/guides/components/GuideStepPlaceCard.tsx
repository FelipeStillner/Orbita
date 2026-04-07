import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { GuideStepPlace } from "@api";
import { Text, LazyCoverImage } from "@components";
import { getHomeCardImageUrl } from "@helpers/imageUrls";
import { formatDistanceMeters } from "@helpers/formatDistance";
import { formatPlaceTagLabel } from "@helpers/formatPlaceTag";
import { ImageIcon } from "@assets/icons";

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x300/1a1a1a/FFF?text=No+Image";

/** Matches home PlaceCard chips (readable on bright images). */
const chipClassName =
  "rounded-md border border-white/15 bg-black/60 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-white/95 backdrop-blur-sm tabular-nums";

interface GuideStepPlaceCardProps {
  guideId: string;
  place: GuideStepPlace;
  /** Map label for screen readers (e.g. `1a`); not shown on the card to match home PlaceCard. */
  mapLabel: string;
  /** Client-computed distance when geolocation is available. */
  distanceMeters?: number;
}

/** Home-style vertical image card; link opens place on this guide route. */
export default function GuideStepPlaceCard({
  guideId,
  place,
  mapLabel,
  distanceMeters,
}: GuideStepPlaceCardProps) {
  const rawImageUrl =
    place.primary_image_url?.trim() || PLACEHOLDER_IMAGE;
  const imageUrl = getHomeCardImageUrl(rawImageUrl);
  /** Match home PlaceCard: prefer API count, else infer from primary image. */
  const photoCount =
    typeof place.photo_count === "number"
      ? place.photo_count
      : place.primary_image_url?.trim()
        ? 1
        : 0;
  const likeCount = place.like_count ?? 0;
  const tags = (place.tags ?? []).filter(Boolean);
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
      to={`/guides/${guideId}?place=${place.place_id}`}
      className="group block w-full overflow-hidden rounded-2xl border border-white/10 glass-medium transition-all duration-300 hover:border-white/20 hover:glass-strong"
      aria-label={`${mapLabel} ${place.name}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 origin-center transition-transform duration-300 ease-out group-hover:scale-105">
            <LazyCoverImage src={imageUrl} alt="" className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        </div>
        {typeof distanceMeters === "number" && (
          <div className={`absolute left-3 top-3 z-10 tabular-nums ${chipClassName}`}>
            {formatDistanceMeters(distanceMeters)}
          </div>
        )}
        <div
          className={`absolute right-3 top-3 z-10 flex items-center gap-1 ${chipClassName}`}
          aria-label={`${photoCount} ${photoCount === 1 ? "image" : "images"}`}
        >
          <span className="tabular-nums leading-none">{photoCount}</span>
          <ImageIcon className="h-3 w-3 shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 space-y-1.5 p-3">
          {showMetaRow && metaParts.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-medium leading-tight tracking-tight text-white/90">
              {metaParts.map((part, i) => (
                <Fragment key={part.key}>
                  {i > 0 && <span className="text-white/35">·</span>}
                  {part.node}
                </Fragment>
              ))}
            </div>
          )}
          <Text
            variant="body-sm"
            className="line-clamp-2 font-medium text-white drop-shadow-lg"
          >
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
                <span className="text-[9px] font-medium text-white/55">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
