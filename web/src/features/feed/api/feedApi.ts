import axios from "axios";
import type { FeatureCollection } from "../types";

export const fetchPlaces = async (lat: number, lng: number, page: number) => {
  const { data } = await axios.get<FeatureCollection>(`/api/places`, {
    params: { lat, long: lng, page, limit: 5 },
  });
  return data;
};
