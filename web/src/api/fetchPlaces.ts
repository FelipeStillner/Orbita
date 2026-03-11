import axios from "axios";
import type { PlacesResponse } from "@place";
import { getAuthHeaders } from "@helpers/getAuthHeaders";

export const fetchPlaces = async (
  lat: number,
  lng: number,
  page: number,
  limit = 5
) => {
  const { data } = await axios.get<PlacesResponse>(`/api/places`, {
    params: { lat, long: lng, page, limit },
    headers: getAuthHeaders(),
  });
  return data;
};
