export interface Image {
  url: string;
  description: string;
  is_primary: boolean;
}

export interface PlaceCollection {
  id: string;
  name: string;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  description: string;
  images: Image[] | null; // Can be null if no images
  liked: boolean;
  collections?: PlaceCollection[];
  latitude: number;
  longitude: number;
}

export interface PlacesResponse {
  places: Place[];
  meta: {
    page: number;
    limit: number;
  };
}
