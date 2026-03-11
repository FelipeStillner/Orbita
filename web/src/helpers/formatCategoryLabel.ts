const CATEGORY_LABELS: Record<string, string> = {
  castle: "Castles",
  hotel: "Hotels",
  theatre: "Theatres",
  arts_centre: "Arts Centres",
  manor: "Manors",
  museum: "Museums",
  building: "Notable Buildings",
  attraction: "Attractions",
  monument: "Monuments",
  place_of_worship: "Places of Worship",
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

