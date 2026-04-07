interface Image {
  url: string;
  description: string;
  is_primary: boolean;
}

interface PlaceGuide {
  id: string;
  name: string;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  description: string;
  images: Image[];
  liked: boolean;
  guides?: PlaceGuide[];
  latitude: number;
  longitude: number;
  tags?: string[];
  opening_hours?: string;
  like_count?: number;
  save_count?: number;
  hide_count?: number;
  /** Present when the client requested `lat` + `long` on `GET /api/places/:id`. */
  distance_meters?: number;
  is_open_now?: boolean;
}

export interface PlaceListItem {
  id: string;
  name: string;
  category: string;
  images: Image[];
  latitude?: number;
  longitude?: number;
  distance_meters?: number;
  like_count?: number;
  tags?: string[];
  photo_count?: number;
  is_open_now?: boolean;
}

export interface PlacesListResponse {
  places: PlaceListItem[];
}

export interface HomeCategorySection {
  category: string;
  places: PlaceListItem[];
}

export interface HomeResponse {
  categories: HomeCategorySection[];
}
