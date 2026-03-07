import axios from "axios";
import type { FeatureCollection } from "../types";

export const fetchPlaces = async (lat: number, lng: number, page: number) => {
  const googleToken = localStorage.getItem("auth_token");
  if (!googleToken) {
    throw new Error("No Google token found");
  }

  const { data } = await axios.get<FeatureCollection>(`/api/places`, {
    params: { lat, long: lng, page, limit: 5 },
    headers: {
      'Authorization': `Bearer ${googleToken}`,
      'Content-Type': 'application/json'
    },
  });
  return data;
};
