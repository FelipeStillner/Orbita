import { Link } from "react-router-dom";
import type { Place } from "@types";
import { Text } from "@components";

interface Props {
  place: Place;
}

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x300/1a1a1a/FFF?text=No+Image";

export default function PlaceCard({ place }: Props) {
  const imageUrl =
    place.images?.[0]?.url ??
    place.images?.find((i) => i.is_primary)?.url ??
    PLACEHOLDER_IMAGE;

  return (
    <Link
      to={`/place/${place.id}`}
      state={{ place }}
      className="flex-shrink-0 w-[160px] sm:w-[200px] group block rounded-2xl overflow-hidden glass-medium border border-white/10 hover:glass-strong hover:border-white/20 transition-all duration-300"
    >
      <div
        className="relative aspect-[3/4] w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Text variant="body-sm" className="font-medium line-clamp-2 text-white drop-shadow-lg">
            {place.name}
          </Text>
        </div>
      </div>
    </Link>
  );
}
