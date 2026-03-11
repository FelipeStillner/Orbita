import type { PlaceListItem } from "@types";
import { Text } from "@components";
import { getCategoryLabel } from "@helpers/formatCategoryLabel";
import PlaceCard from "./PlaceCard";

interface Props {
  category: string;
  places: PlaceListItem[];
}

export default function CategorySection({ category, places }: Props) {
  if (places.length === 0) return null;

  const label = getCategoryLabel(category);

  return (
    <section className="animate-fade-slide-up px-6">
      <Text variant="h3" className="text-white font-semibold pb-2">
        {label}
      </Text>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 scroll-smooth">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </section>
  );
}
