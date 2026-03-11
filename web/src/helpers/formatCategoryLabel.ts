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
  city_gate: "City Gates",
  square: "Squares",
  highway: "Highways",
  memorial: "Memorials",
  wayside_shrine: "Wayside Shrines",
  artwork: "Artwork",
  chapel: "Chapels",
  library: "Libraries",
  ruins: "Ruins",
  townhall: "Town Halls",
  wayside_cross: "Wayside Crosses",
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

