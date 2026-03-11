interface Image {
  url: string;
  description: string;
  is_primary: boolean;
}

interface PlaceCollection {
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
  collections?: PlaceCollection[];
  latitude: number;
  longitude: number;
  tags?: string[];
  opening_hours?: string;
  like_count?: number;
  save_count?: number;
  hide_count?: number;
}

export interface PlaceListItem {
  id: string;
  name: string;
  category: string;
  images: Image[];
}

export interface PlacesResponse {
  places: PlaceListItem[];
  meta: {
    page: number;
    limit: number;
  };
}
