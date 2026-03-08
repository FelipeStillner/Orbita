export interface Image {
  url: string;
  description: string;
  is_primary: boolean;
}

export interface PlaceCollection {
  id: string;
  name: string;
}

export interface PlaceProperties {
  id: string;
  name: string;
  category: string;
  description: string;
  images: Image[] | null; // Can be null if no images
  liked: boolean;
  collections?: PlaceCollection[];
}

export interface PlaceFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: PlaceProperties;
}

export interface FeatureCollection {
  type: "FeatureCollection";
  features: PlaceFeature[];
}
